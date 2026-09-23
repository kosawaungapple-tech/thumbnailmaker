/**
 * Image processing utilities for reliable mobile export and thumbnail rendering.
 */

const dataUrlCache = new Map<string, string>();

/**
 * Converts any image URL (HTTP/HTTPS/blob) into a Base64 Data URL.
 * Uses both direct fetch and canvas-based cross-origin fallback.
 */
export async function urlToDataUrl(url: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  // Check in-memory cache
  if (dataUrlCache.has(url)) {
    return dataUrlCache.get(url)!;
  }

  // Strategy 1: Direct fetch with CORS mode
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      cache: 'force-cache',
    });
    if (response.ok) {
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('FileReader result is not a string'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });

      if (dataUrl && dataUrl.startsWith('data:')) {
        dataUrlCache.set(url, dataUrl);
        return dataUrl;
      }
    }
  } catch (err) {
    console.warn('Direct fetch to DataURL failed, falling back to canvas decoding:', err);
  }

  // Strategy 2: Image element with crossOrigin = 'anonymous' drawn to canvas
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';

      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 8000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 1280;
          canvas.height = img.naturalHeight || img.height || 720;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            resolve(url);
            return;
          }
          ctx.drawImage(img, 0, 0);
          const result = canvas.toDataURL('image/jpeg', 0.92);
          resolve(result);
        } catch (canvasErr) {
          console.warn('Canvas toDataURL failed (tainted canvas):', canvasErr);
          resolve(url);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(url);
      };

      img.src = url;
    });

    if (dataUrl && dataUrl.startsWith('data:')) {
      dataUrlCache.set(url, dataUrl);
      return dataUrl;
    }
  } catch (err) {
    console.warn('Canvas fallback to DataURL failed:', err);
  }

  return url;
}

/**
 * Optimizes an uploaded image file (from mobile camera roll or file picker)
 * Resizes large 12MP-48MP photos to max 1920px so mobile Safari/Chrome doesn't crash on export.
 */
export async function processUploadedFile(file: File, maxDim = 1920): Promise<string> {
  return new Promise((resolve) => {
    const isPng = file.type === 'image/png';
    const reader = new FileReader();

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // If image is already reasonably sized, return raw dataUrl directly
        if (width <= maxDim && height <= maxDim && file.size < 2 * 1024 * 1024) {
          resolve(rawDataUrl);
          return;
        }

        // Downscale maintaining aspect ratio
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Preserve PNG transparency if PNG, else JPEG for backgrounds
        const mime = isPng ? 'image/png' : 'image/jpeg';
        const quality = isPng ? undefined : 0.92;
        resolve(canvas.toDataURL(mime, quality));
      };

      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };

    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Ensures all <img> elements inside a container are fully loaded and decoded.
 */
export async function preloadAllImagesInElement(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      if (!img.complete || img.naturalWidth === 0) {
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 3000); // 3-second safety timeout
        });
      }
      if ('decode' in img) {
        try {
          await img.decode();
        } catch {
          // Ignore decode errors on already displayed elements
        }
      }
    })
  );
}
