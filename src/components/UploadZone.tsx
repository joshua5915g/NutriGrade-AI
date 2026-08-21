'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Camera,
  FileText,
  ImageIcon,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Barcode,
  Layers,
  ScanLine,
  Package,
  RotateCcw,
  Grid3X3,
} from 'lucide-react';

import { SampleDemos, SampleType } from './SampleDemos';
import { BarcodeScanner } from './BarcodeScanner';
import { LiveCameraScanner } from './LiveCameraScanner';
import { compressAndEnhanceImage } from '../lib/utils/imageCompressor';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onDualFilesSelected?: (frontFile: File, backFile: File) => void;
  onMultiItemSelected?: (file: File) => void;
  onSelectSample?: (sampleType: SampleType) => void;
  onBarcodeSubmitted?: (barcode: string) => void;
  isAnalyzing?: boolean;
  error?: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  onDualFilesSelected,
  onMultiItemSelected,
  onSelectSample,
  onBarcodeSubmitted,
  isAnalyzing = false,
  error = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Dual-scan state
  const [isDualMode, setIsDualMode] = useState(false);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  // Live Camera Scanner Modal State
  const [isLiveScannerOpen, setIsLiveScannerOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'single' | 'front' | 'back'>('single');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Validate file before processing (image formats restricted, PDFs deprecated for food scans)
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      alert('Unsupported format. Please capture or upload a JPEG, PNG, or WebP food label image.');
      return false;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit.');
      return false;
    }
    return true;
  };

  // Handle Drag & Drop events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return;

      const optimizedFile = await compressAndEnhanceImage(file);
      setSelectedFile(optimizedFile);
      onFileSelected(optimizedFile);

      if (optimizedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(optimizedFile));
      } else {
        setPreviewUrl(null);
      }
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Dual-scan file handlers
  const handleFrontFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!validateFile(file)) return;
      const optimized = await compressAndEnhanceImage(file);
      setFrontFile(optimized);
      if (optimized.type.startsWith('image/')) {
        setFrontPreview(URL.createObjectURL(optimized));
      }
    }
  };

  const handleBackFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!validateFile(file)) return;
      const optimized = await compressAndEnhanceImage(file);
      setBackFile(optimized);
      if (optimized.type.startsWith('image/')) {
        setBackPreview(URL.createObjectURL(optimized));
      }
    }
  };

  const handleDualSubmit = () => {
    if (frontFile && backFile && onDualFilesSelected) {
      onDualFilesSelected(frontFile, backFile);
    }
  };

  // Camera start/stop/capture
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera. Please check browser permissions.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          processFile(file);
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearDualSelection = () => {
    setFrontFile(null);
    setBackFile(null);
    setFrontPreview(null);
    setBackPreview(null);
    if (frontInputRef.current) frontInputRef.current.value = '';
    if (backInputRef.current) backInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Direct Barcode Scanner Component */}
      {onBarcodeSubmitted && (
        <BarcodeScanner
          onBarcodeDetected={onBarcodeSubmitted}
          isSearching={isAnalyzing}
        />
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={frontInputRef}
        onChange={handleFrontFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={backInputRef}
        onChange={handleBackFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* ━━━ SCAN MODE TOGGLE SWITCH ━━━ */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex-wrap justify-center gap-0.5">
          <button
            onClick={() => { setIsDualMode(false); clearDualSelection(); }}
            className={`px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              !isDualMode
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            Single Label
          </button>
          <button
            onClick={() => { setIsDualMode(true); clearSelection(); }}
            className={`px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              isDualMode
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Dual Scan
          </button>
          {onMultiItemSelected && (
            <button
              onClick={() => {
                setIsDualMode(false);
                clearSelection();
                clearDualSelection();
                // Signal multi-item mode through the file input
              }}
              className="px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              Multi-Item Scan
            </button>
          )}
        </div>
      </div>

      {/* ━━━ MAIN UPLOAD CARD ━━━ */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 shadow-2xl transition-all duration-300">
        <AnimatePresence mode="wait">
          {/* ════════════════════ DUAL SCAN MODE ════════════════════ */}
          {isDualMode ? (
            <motion.div
              key="dual-scan-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 md:p-8 space-y-5"
            >
              {/* Title */}
              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <Layers className="w-5 h-5 text-violet-500" />
                  Dual-Image Cross-Verification Scan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Upload the front packaging (marketing claims) and back label (nutrition facts) for an AI-powered regulatory cross-check audit.
                </p>
              </div>

              {/* Two Upload Boxes Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Box 1: Front of Package */}
                <div
                  onClick={() => frontInputRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[200px] group ${
                    frontFile
                      ? 'border-violet-500/40 bg-violet-500/5'
                      : 'border-slate-300/80 dark:border-slate-700/80 hover:border-violet-500/60 hover:bg-violet-500/5'
                  }`}
                >
                  {frontPreview ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden">
                      <img
                        src={frontPreview}
                        alt="Front preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {!isAnalyzing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFrontFile(null);
                            setFrontPreview(null);
                            if (frontInputRef.current) frontInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 mb-3 group-hover:scale-110 transition-transform">
                        <Package className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Front of Package
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        Marketing claims & branding
                      </span>
                    </>
                  )}

                  {frontFile && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-violet-600 dark:text-violet-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[140px]">{frontFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Box 2: Back of Package */}
                <div
                  onClick={() => backInputRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[200px] group ${
                    backFile
                      ? 'border-teal-500/40 bg-teal-500/5'
                      : 'border-slate-300/80 dark:border-slate-700/80 hover:border-teal-500/60 hover:bg-teal-500/5'
                  }`}
                >
                  {backPreview ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden">
                      <img
                        src={backPreview}
                        alt="Back preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {!isAnalyzing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBackFile(null);
                            setBackPreview(null);
                            if (backInputRef.current) backInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Back of Package
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        Nutrition facts & ingredients
                      </span>
                    </>
                  )}

                  {backFile && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-teal-600 dark:text-teal-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[140px]">{backFile.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dual Submit Button */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={clearDualSelection}
                  disabled={!frontFile && !backFile}
                  className="px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-all border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  onClick={handleDualSubmit}
                  disabled={!frontFile || !backFile || isAnalyzing}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-xl shadow-violet-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Analyzing Dual Images...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run Cross-Verification Audit
                    </>
                  )}
                </button>
              </div>

              <span className="block text-center text-[11px] text-slate-400 dark:text-slate-500">
                Supports JPEG, PNG, PDF up to 10MB each
              </span>
            </motion.div>
          ) : isCameraActive ? (
            /* ════════════════════ CAMERA VIEW ════════════════════ */
            <motion.div
              key="camera-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative aspect-video bg-black flex flex-col items-center justify-center overflow-hidden"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-8 border-2 border-dashed border-emerald-400/70 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-emerald-400/90 text-xs font-mono bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                  Position Food Label / Barcode in Frame
                </span>
              </div>

              <div className="absolute bottom-6 flex items-center gap-4 z-10">
                <button
                  onClick={stopCamera}
                  className="p-3 rounded-full bg-slate-800/80 hover:bg-slate-800 text-white backdrop-blur-md transition-all shadow-lg"
                  aria-label="Cancel Camera"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium shadow-xl shadow-emerald-500/20 backdrop-blur-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  <span>Capture Photo</span>
                </button>
              </div>
            </motion.div>
          ) : selectedFile ? (
            /* ════════════════════ SINGLE FILE PREVIEW ════════════════════ */
            <motion.div
              key="preview-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 md:p-8 flex flex-col items-center justify-center relative min-h-[320px]"
            >
              {!isAnalyzing && (
                <button
                  onClick={clearSelection}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all z-20"
                  aria-label="Remove File"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800/50 bg-slate-100 dark:bg-slate-950 flex items-center justify-center group">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Food label preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-6 text-slate-500">
                    <FileText className="w-16 h-16 text-emerald-500" />
                    <span className="text-sm font-medium text-center truncate max-w-full">
                      {selectedFile.name}
                    </span>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none">
                    <motion.div
                      initial={{ top: '0%' }}
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col items-center gap-2">
                {isAnalyzing ? (
                  <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium text-sm animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Analyzing Label with Dual-Layer Pipeline...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="truncate max-w-xs">{selectedFile.name}</span>
                    <span className="text-xs text-slate-400">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ════════════════════ EMPTY DROPZONE ════════════════════ */
            <motion.div
              key="dropzone-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 md:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed rounded-3xl ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 scale-[0.99]'
                  : 'border-slate-300/80 dark:border-slate-700/80 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
              }`}
            >
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-500 shadow-md">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
              </div>

              <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                Scan Barcode or Upload Food Label
              </h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Drag and drop your food packaging image or PDF here, or click to browse.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium transition-all shadow-md active:scale-95"
                >
                  Browse Files
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiveScannerOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2 active:scale-95"
                >
                  <Camera className="w-4 h-4 text-emerald-500" />
                  <span>Live Camera Scanner</span>
                </button>
              </div>

              {onSelectSample && <SampleDemos onSelectSample={onSelectSample} />}

              <span className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
                Supports Mobile JPEG, PNG, WebP up to 15MB (Fast Canvas Pre-Processing)
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-rose-500/10 border-t border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Interactive Mobile Camera Scanner Modal */}
      <LiveCameraScanner
        isOpen={isLiveScannerOpen}
        onClose={() => setIsLiveScannerOpen(false)}
        onCapture={(capturedFile) => processFile(capturedFile)}
      />
    </div>
  );
};
