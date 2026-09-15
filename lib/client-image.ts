import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
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

/** A pixel rectangle in the coordinate space of the (rotated) original image. */
export type CropArea = { x: number; y: number; width: number; height: number };

type Drawable = CanvasImageSource & { width: number; height: number };

const mb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/** Returns a plain-language problem with the file, or null when it can be used. */
export function validateImageFile(file: File): string | null {
  const extension = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? '';
  const typeOk =
    ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number]) ||
    (!file.type && ACCEPTED_EXTENSIONS.split(',').includes(extension));

  if (!typeOk) return 'Only JPG, PNG and WebP images can be uploaded.';
  if (file.size > MAX_SOURCE_BYTES) {
    return (
      `That file is ${mb(file.size)}. Photos up to ${mb(MAX_SOURCE_BYTES)} can be compressed ` +
      'automatically — please choose a smaller original.'
    );
  }
  return null;
}

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
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);

  if (file.size <= MAX_UPLOAD_BYTES) return { file, compressed: false };

  const bitmap = await decode(file);
  try {
    const spec = IMAGE_SPECS[purpose];

    // The smallest size that still covers the stored dimensions.
    const cover = spec.fixed
      ? Math.max(spec.width / bitmap.width, spec.height / bitmap.height)
      : spec.width / bitmap.width;

    const blob = await encodeWithinLimit(bitmap, cover, [0.92, 0.86]);
    return { file: toFile(blob, file.name), compressed: true };
  } finally {
    bitmap.close?.();
  }
}

/**
 * Cuts the chosen area out of the full-resolution original.
 *
 * Cropping works on the original pixels rather than a preview, so zooming in on
 * part of a large photo keeps all of its detail. Rotation is in 90° steps, which
 * never enlarges the canvas beyond the photo's own size.
 */
export async function cropImage(
  file: File,
  area: CropArea,
  rotation: number,
  purpose: ImagePurpose
): Promise<File> {
  const bitmap = await decode(file);
  const rotated = document.createElement('canvas');
  const cropped = document.createElement('canvas');

  try {
    const turns = Math.round((((rotation % 360) + 360) % 360) / 90) % 4;
    const swap = turns % 2 === 1;

    rotated.width = swap ? bitmap.height : bitmap.width;
    rotated.height = swap ? bitmap.width : bitmap.height;
    const rotatedContext = rotated.getContext('2d')!;
    rotatedContext.translate(rotated.width / 2, rotated.height / 2);
    rotatedContext.rotate((turns * Math.PI) / 2);
    rotatedContext.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

    // Clamp to the image so rounding at an edge never samples empty pixels.
    const x = clamp(Math.round(area.x), 0, rotated.width - 1);
    const y = clamp(Math.round(area.y), 0, rotated.height - 1);
    const width = clamp(Math.round(area.width), 1, rotated.width - x);
    const height = clamp(Math.round(area.height), 1, rotated.height - y);

    cropped.width = width;
    cropped.height = height;
    cropped.getContext('2d')!.drawImage(rotated, x, y, width, height, 0, 0, width, height);

    // Release the full-size rotated copy before encoding (matters on iOS Safari).
    rotated.width = 0;
    rotated.height = 0;

    const spec = IMAGE_SPECS[purpose];
    const blob = await encodeWithinLimit(cropped, spec.width / width, [0.95, 0.9, 0.85]);
    return toFile(blob, file.name);
  } finally {
    bitmap.close?.();
    cropped.width = 0;
    cropped.height = 0;
  }
}

/**
 * Encodes at the highest quality that fits under the request limit, keeping
 * 1.5× headroom over the stored size where possible.
 */
async function encodeWithinLimit(
  source: Drawable,
  scaleToStored: number,
  qualities: number[]
): Promise<Blob> {
  for (const headroom of [1.5, 1.2, 1]) {
    for (const quality of qualities) {
      const blob = await render(source, Math.min(1, scaleToStored * headroom), quality);
      if (blob.size <= MAX_REQUEST_BYTES) return blob;
    }
  }
  throw new Error('This photo could not be compressed enough to upload. Please try another.');
}

function toFile(blob: Blob, originalName: string): File {
  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const base = originalName.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${base}.${extension}`, { type: blob.type });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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
async function render(source: Drawable, scale: number, quality: number): Promise<Blob> {
  const targetWidth = Math.max(1, Math.round(source.width * scale));
  const targetHeight = Math.max(1, Math.round(source.height * scale));

  let current: Drawable = source;
  let width = source.width;
  let height = source.height;

  while (width / 2 >= targetWidth && height / 2 >= targetHeight) {
    width = Math.round(width / 2);
    height = Math.round(height / 2);
    current = draw(current, width, height);
  }

  const canvas = current === source || current.width !== targetWidth || current.height !== targetHeight
    ? draw(current, targetWidth, targetHeight)
    : (current as HTMLCanvasElement);

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

function draw(source: Drawable, width: number, height: number): HTMLCanvasElement {
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
