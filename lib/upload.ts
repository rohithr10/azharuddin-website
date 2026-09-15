import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { dbConnect } from '@/lib/db';
import { Media } from '@/lib/models';
import {
  ACCEPTED_MIME_TYPES,
  IMAGE_SPECS,
  MAX_REQUEST_BYTES,
  MAX_UPLOAD_BYTES,
  type ImagePurpose,
} from '@/lib/image-specs';

/** Legacy location for images stored before uploads moved into the database. */
const LEGACY_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export type SavedImage = {
  url: string;
  width: number;
  height: number;
  size: number;
};

/**
 * Validates, normalises and stores an uploaded image.
 *
 * The bytes are kept in MongoDB rather than on disk. That keeps uploads working
 * on hosts with a read-only filesystem (Vercel and other serverless platforms)
 * without introducing a separate object store, and means the images travel with
 * the database in a backup.
 *
 * Everything is re-encoded to WebP, which also strips any payload hidden in the
 * original file, and images with a fixed spec are resized and centre-cropped to
 * exactly that size so the layout never shifts.
 */
export async function saveUpload(
  file: File,
  purpose: ImagePurpose = 'general',
  alt = ''
): Promise<SavedImage> {
  if (!file || typeof file === 'string' || file.size === 0) {
    throw new Error('No file was received.');
  }
  if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
    throw new Error('Only JPG, PNG and WebP images can be uploaded.');
  }
  // The CMS compresses large photos in the browser before sending them, so
  // only something that bypassed it can arrive this large.
  if (file.size > MAX_REQUEST_BYTES) {
    throw new Error(
      `That file is ${(file.size / (1024 * 1024)).toFixed(1)} MB, which is too large to receive. ` +
        'Please upload it through the content manager, which compresses it automatically.'
    );
  }

  const spec = IMAGE_SPECS[purpose];
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  const base = sharp(inputBuffer, { failOn: 'error' }).rotate(); // honour EXIF orientation

  if (spec.fixed) {
    base.resize(spec.width, spec.height, {
      fit: 'cover',
      position: 'attention',
      kernel: 'lanczos3',
    });
  } else {
    base.resize({ width: spec.width, withoutEnlargement: true, kernel: 'lanczos3' });
  }

  // A light sharpen restores the crispness downscaling softens.
  base.sharpen({ sigma: 0.5 });

  // Start at high quality and only step down if the result would exceed the
  // stored-size limit. At these dimensions the first pass almost always fits.
  let encoded: { data: Buffer; info: sharp.OutputInfo } | null = null;
  for (const quality of [90, 85, 80, 74, 68]) {
    encoded = await base
      .clone()
      .webp({ quality, effort: 5, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
    if (encoded.data.length <= MAX_UPLOAD_BYTES) break;
  }

  if (!encoded || encoded.data.length > MAX_UPLOAD_BYTES) {
    throw new Error('This image could not be compressed under 2 MB. Please try another photo.');
  }

  const { data, info } = encoded;

  await dbConnect();

  const media = new Media({
    url: 'pending',
    filename: `${purpose}-${Date.now().toString(36)}.webp`,
    originalName: file.name?.slice(0, 180) ?? '',
    data,
    mimeType: 'image/webp',
    width: info.width,
    height: info.height,
    size: data.length,
    alt,
    purpose,
  });

  // The record's own id forms its permanent, immutable URL.
  media.url = `/api/media/${media._id}.webp`;
  await media.save();

  return { url: media.url, width: info.width, height: info.height, size: data.length };
}

/**
 * Removes an image from the library. Handles both database-backed images and
 * files left on disk by an earlier version.
 */
export async function deleteUpload(url?: string | null): Promise<void> {
  if (!url) return;

  await dbConnect();

  if (url.startsWith('/api/media/')) {
    await Media.deleteOne({ url });
    return;
  }

  if (url.startsWith('/uploads/')) {
    const filename = path.basename(url);
    const resolved = path.resolve(path.join(LEGACY_UPLOAD_DIR, filename));

    // Never touch anything outside the uploads directory.
    if (resolved.startsWith(path.resolve(LEGACY_UPLOAD_DIR) + path.sep)) {
      try {
        await fs.unlink(resolved);
      } catch {
        // Already gone — removing the database record below is still correct.
      }
    }

    await Media.deleteOne({ url });
  }
}

/** True when the URL points at a file this app manages. */
export function isManagedUpload(url?: string | null): boolean {
  return Boolean(url && (url.startsWith('/api/media/') || url.startsWith('/uploads/')));
}
