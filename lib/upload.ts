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

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export type SavedImage = {
  url: string;
  width: number;
  height: number;
  size: number;
};

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function randomName() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Validates, normalises and stores an uploaded image.
 *
 * Oversized photographs are accepted and downscaled rather than rejected, so
 * the client is never blocked by a camera's native resolution. Everything is
 * re-encoded to WebP, which strips any embedded payload from the original file.
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
  if (file.size > MAX_UPLOAD_BYTES * 4) {
    throw new Error(
      `That file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Please use an image under 8 MB.`
    );
  }

  const spec = IMAGE_SPECS[purpose];
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  const pipeline = sharp(inputBuffer, { failOn: 'error' })
    .rotate() // honour EXIF orientation
    .resize({ width: spec.maxWidth, withoutEnlargement: true })
    .webp({ quality: 84, effort: 4 });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  await ensureUploadDir();
  const filename = `${purpose}-${randomName()}.webp`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), data);

  const url = `/uploads/${filename}`;

  await dbConnect();
  await Media.create({
    url,
    filename,
    originalName: file.name?.slice(0, 180) ?? '',
    mimeType: 'image/webp',
    width: info.width,
    height: info.height,
    size: data.length,
    alt,
    purpose,
  });

  return { url, width: info.width, height: info.height, size: data.length };
}

/**
 * Removes a file from disk and from the media library. Only paths inside
 * /public/uploads are touched, so a crafted URL cannot delete anything else.
 */
export async function deleteUpload(url?: string | null): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;

  const filename = path.basename(url);
  const target = path.join(UPLOAD_DIR, filename);
  const resolved = path.resolve(target);
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) return;

  try {
    await fs.unlink(resolved);
  } catch {
    // Already gone — removing the database record below is still correct.
  }

  await dbConnect();
  await Media.deleteOne({ url });
}

/** True when the URL points at a file this app manages. */
export function isManagedUpload(url?: string | null): boolean {
  return Boolean(url && url.startsWith('/uploads/'));
}
