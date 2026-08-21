'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Zap, ZapOff, X, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { compressAndEnhanceImage } from '../lib/utils/imageCompressor';

interface LiveCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  labelPrompt?: string;
}

export const LiveCameraScanner: React.FC<LiveCameraScannerProps> = ({
  isOpen,
  onClose,
  onCapture,
  labelPrompt = 'Align nutrition label or barcode within frame',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Native file input fallback for browsers without WebRTC camera access
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Initialize WebRTC environment camera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isSubscribed = true;

    const startCamera = async () => {
      setCameraError(null);
      setIsCameraActive(false);

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera stream API is not supported on this browser.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!isSubscribed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.warn);
        }

        setIsCameraActive(true);

        // Check if torch/flashlight is supported on the environment video track
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
          if (capabilities.torch) {
            setIsTorchSupported(true);
          }
        }
      } catch (err: any) {
        console.error('WebRTC camera error:', err);
        if (isSubscribed) {
          setCameraError(
            err.message || 'Unable to access camera. Please allow camera permissions or use file upload.'
          );
        }
      }
    };

    startCamera();

    return () => {
      isSubscribed = false;
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
    setIsTorchSupported(false);
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  };

  // Capture image frame from video feed
  const captureFrame = async () => {
    if (!videoRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to create canvas context');
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setIsCapturing(false);
            return;
          }

          const rawFile = new File([blob], `camera_scan_${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          // Pre-process through canvas contrast & downscaling pipeline
          const optimizedFile = await compressAndEnhanceImage(rawFile);
          stopCamera();
          setIsCapturing(false);
          onCapture(optimizedFile);
          onClose();
        },
        'image/jpeg',
        0.9
      );
    } catch (error) {
      console.error('Camera frame capture error:', error);
      setIsCapturing(false);
    }
  };

  // Fallback native mobile camera upload handler
  const handleNativeInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const rawFile = e.target.files[0];
      const optimizedFile = await compressAndEnhanceImage(rawFile);
      stopCamera();
      onCapture(optimizedFile);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg h-full max-h-[85vh] bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between"
          >
            {/* VIEWFINDER HEADER */}
            <div className="absolute top-0 inset-x-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Camera className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-white tracking-wide">
                  Live Scanner
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isTorchSupported && (
                  <button
                    onClick={toggleTorch}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-all border ${
                      isTorchOn
                        ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/30'
                        : 'bg-black/50 text-slate-300 border-white/20 hover:bg-white/20'
                    }`}
                    title={isTorchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                  >
                    {isTorchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                  </button>
                )}

                <button
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="p-2.5 rounded-full bg-black/50 hover:bg-white/20 text-slate-300 hover:text-white transition-colors border border-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* VIDEO FEED & VIEWFINDER OVERLAY */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center space-y-4 max-w-xs">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-300 leading-relaxed">
                    {cameraError}
                  </p>
                  <button
                    onClick={() => nativeInputRef.current?.click()}
                    className="py-2.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-lg"
                  >
                    Open Device Camera
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Rounded Bounding Box Viewfinder Frame */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-3xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-between p-4">
                      {/* Four Corner Accents */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />

                      {/* Animated Scanning Laser Line */}
                      <motion.div
                        animate={{ y: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]"
                      />
                    </div>
                  </div>

                  {/* Viewfinder Guidance Subtitle */}
                  <div className="absolute bottom-24 inset-x-0 text-center pointer-events-none px-4">
                    <span className="inline-block text-xs font-semibold text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                      {labelPrompt}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* VIEWFINDER FOOTER CAPTURE CONTROLS */}
            <div className="p-5 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-center gap-6">
              <button
                onClick={captureFrame}
                disabled={!isCameraActive || isCapturing}
                className={`p-4 rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${
                  isCapturing ? 'animate-pulse' : ''
                }`}
                title="Capture Photo"
              >
                <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
              </button>

              {/* Native Input Fallback */}
              <input
                ref={nativeInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleNativeInputChange}
                className="hidden"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
