import {
  IMAGE_SPECS,
  MAX_REQUEST_BYTES,
  MAX_SOURCE_BYTES,
  MAX_UPLOAD_BYTES,
  type ImagePurpose,
} from '@/lib/image-specs';

export type PreparedImage = {
  file: File;
  compressed: boolean;
};

const mb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/**
 * Makes a photo small enough to upload without visibly changing it.
 *
 * Files already under 2 MB are sent untouched, so the server makes the only
 * re-encode. Larger ones are downscaled here — never below 1.5× the size they
 * will be stored at, so the server's final high-quality resize still has spare
 * detail to work with — and re-encoded at high quality. This also keeps every
 * request under Vercel's 4.5 MB limit, which a phone photo would otherwise hit.
 */
export async function prepareImageForUpload(
  file: File,
  purpose: ImagePurpose
): Promise<PreparedImage> {
  if (file.size <= MAX_UPLOAD_BYTES) return { file, compressed: false };

  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error(
      `That file is ${mb(file.size)}. Photos up to ${mb(MAX_SOURCE_BYTES)} can be compressed ` +
        'automatically — please choose a smaller original.'
    );
  }

  const bitmap = await decode(file);
  try {
    const spec = IMAGE_SPECS[purpose];

    // The smallest size that still covers the stored dimensions, with headroom.
    const cover = spec.fixed
      ? Math.max(spec.width / bitmap.width, spec.height / bitmap.height)
      : spec.width / bitmap.width;

    for (const headroom of [1.5, 1.2, 1]) {
      for (const quality of [0.92, 0.86]) {
        const scale = Math.min(1, cover * headroom);
        const blob = await render(bitmap, scale, quality);
        if (blob.size <= MAX_REQUEST_BYTES) {
          const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
          const base = file.name.replace(/\.[^.]+$/, '') || 'image';
          return {
            file: new File([blob], `${base}.${extension}`, { type: blob.type }),
            compressed: true,
          };
        }
      }
    }

    throw new Error('This photo could not be compressed enough to upload. Please try another.');
  } finally {
    bitmap.close?.();
  }
}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Older browsers: decode through an <img> element instead.
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = 'async';
      image.src = url;
      await image.decode();
      return await createImageBitmap(image);
    } catch {
      throw new Error('This file could not be read as an image. Please use a JPG, PNG or WebP.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

/**
 * Downscales in halving steps. A single large reduction on a canvas blurs fine
 * detail; stepping down keeps edges crisp.
 */
async function render(source: ImageBitmap, scale: number, quality: number): Promise<Blob> {
  const targetWidth = Math.max(1, Math.round(source.width * scale));
  const targetHeight = Math.max(1, Math.round(source.height * scale));

  let current: CanvasImageSource = source;
  let width = source.width;
  let height = source.height;

  while (width / 2 >= targetWidth && height / 2 >= targetHeight) {
    width = Math.round(width / 2);
    height = Math.round(height / 2);
    current = draw(current, width, height);
  }

  const canvas = draw(current, targetWidth, targetHeight);

  const webp = await toBlob(canvas, 'image/webp', quality);
  if (webp && webp.type === 'image/webp') return webp;

  // Browsers without WebP encoding fall back to JPEG, which has no transparency.
  const flattened = document.createElement('canvas');
  flattened.width = targetWidth;
  flattened.height = targetHeight;
  const context = flattened.getContext('2d')!;
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(canvas, 0, 0);

  const jpeg = await toBlob(flattened, 'image/jpeg', quality);
  if (!jpeg) throw new Error('This browser could not compress the image.');
  return jpeg;
}

function draw(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d')!;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
