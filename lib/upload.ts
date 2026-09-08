import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { dbConnect } from '@/lib/db';
import { Media } from '@/lib/models';
import {
  ACCEPTED_MIME_TYPES,
  IMAGE_SPECS,
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
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `That file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The limit is ` +
        `${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB — please compress it and try again.`
    );
  }

  const spec = IMAGE_SPECS[purpose];
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  const pipeline = sharp(inputBuffer, { failOn: 'error' }).rotate(); // honour EXIF orientation

  if (spec.fixed) {
    pipeline.resize(spec.width, spec.height, { fit: 'cover', position: 'attention' });
  } else {
    pipeline.resize({ width: spec.width, withoutEnlargement: true });
  }

  const { data, info } = await pipeline
    .webp({ quality: 84, effort: 4 })
    .toBuffer({ resolveWithObject: true });

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
