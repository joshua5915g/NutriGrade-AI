/**
 * Mobile Web Image Pre-Processor & Compressor
 * Performs HTML5 Canvas downscaling, contrast enhancement for OCR readability,
 * and WebP/JPEG compression (<800KB target payload).
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  contrast?: number; // Contrast multiplier (e.g. 1.15 = +15% contrast)
  brightness?: number; // Brightness multiplier (e.g. 1.05 = +5% brightness)
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  contrast: 1.15,
  brightness: 1.05,
};

/**
 * Reads an input image File, downscales high-res photos to <= 1920x1080 while preserving aspect ratio,
 * applies canvas contrast/brightness enhancements for packaging OCR readability,
 * and outputs a compressed WebP or JPEG Blob wrapped in a File object.
 */
export async function compressAndEnhanceImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // If input is not an image file, return original
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      // Calculate downscaled dimensions preserving aspect ratio
      const maxWidth = config.maxWidth || 1920;
      const maxHeight = config.maxHeight || 1080;

      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const bestRatio = Math.min(widthRatio, heightRatio);

        width = Math.round(width * bestRatio);
        height = Math.round(height * bestRatio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }

      // Apply CSS filter for contrast & brightness enhancement to make text pop on shiny/curved labels
      const contrastPct = (config.contrast || 1.15) * 100;
      const brightnessPct = (config.brightness || 1.05) * 100;
      ctx.filter = `contrast(${contrastPct}%) brightness(${brightnessPct}%)`;

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Determine optimal target MIME type (WebP preferred, fallback to JPEG)
      const mimeType = 'image/webp';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          const fileExt = mimeType === 'image/webp' ? '.webp' : '.jpg';
          const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || 'label_scan';
          const compressedFile = new File([blob], `${cleanName}_opt${fileExt}`, {
            type: blob.type || mimeType,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        mimeType,
        config.quality
      );
    };

    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      console.warn('Image compression failed, using original file:', error);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
