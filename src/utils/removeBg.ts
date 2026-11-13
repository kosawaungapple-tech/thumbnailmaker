import { removeBackground, preload, type Config } from '@imgly/background-removal';

/**
 * Faster background removal.
 *
 * Why the old version was slow:
 *  - default model (isnet_fp16, ~88MB) was downloaded on first click
 *  - the full-size photo (up to 1600px) was decoded/post-processed although the
 *    model itself only works at 1024px
 *  - always ran on CPU (wasm, single thread)
 *
 * What this does:
 *  - smallest model (isnet_quint8, roughly half the download and faster inference)
 *  - input downscaled to 1024px max (model's native size)
 *  - WebGPU when available, automatic CPU fallback
 *  - model can be preloaded in the background right after the user picks a photo
 */

const MAX_INPUT_DIM = 1024;

const baseConfig = (device: 'cpu' | 'gpu'): Config => ({
  model: 'isnet_quint8',
  device,
  output: { format: 'image/png' },
});

const hasWebGpu = () => typeof navigator !== 'undefined' && 'gpu' in navigator;

let preloadPromise: Promise<void> | null = null;

/** Start downloading / initialising the model without blocking the UI. */
export function preloadBgModel(): void {
  if (preloadPromise) return;
  preloadPromise = preload(baseConfig('cpu')).catch(() => {
    preloadPromise = null; // allow retry on next call
  });
}

async function downscale(src: string): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Image load failed'));
    i.src = src;
  });

  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  const scale = Math.min(1, MAX_INPUT_DIM / Math.max(w, h));
  w = Math.max(1, Math.round(w * scale));
  h = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(img, 0, 0, w, h);

  const isPng = src.startsWith('data:image/png');
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      isPng ? 'image/png' : 'image/jpeg',
      0.9,
    ),
  );
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

/**
 * Removes the background and returns a PNG data URL.
 * `onProgress` receives 0-100 while model files are downloading.
 */
export async function removeBgFast(
  src: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const input = await downscale(src);

  const run = (device: 'cpu' | 'gpu') =>
    removeBackground(input, {
      ...baseConfig(device),
      progress: (_key, current, total) => {
        if (onProgress && total > 0) onProgress(Math.min(100, Math.round((current / total) * 100)));
      },
    });

  let result: Blob;
  if (hasWebGpu()) {
    try {
      result = await run('gpu');
    } catch (err) {
      console.warn('WebGPU background removal failed, falling back to CPU', err);
      result = await run('cpu');
    }
  } else {
    result = await run('cpu');
  }
  return blobToDataUrl(result);
}
