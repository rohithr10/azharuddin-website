/**
 * Single source of truth for upload guidance. The CMS renders these strings
 * next to each upload field, and the server uses maxWidth/maxBytes to
 * normalise what is stored on disk.
 */
export type ImagePurpose = 'hero' | 'featured' | 'article' | 'about' | 'footer' | 'general';

export type ImageSpec = {
  label: string;
  width: number;
  height: number;
  ratio: string;
  maxBytes: number;
  maxWidth: number;
  note: string;
};

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB, per the design spec

export const IMAGE_SPECS: Record<ImagePurpose, ImageSpec> = {
  hero: {
    label: 'Header banner (hero section)',
    width: 1920,
    height: 850,
    ratio: '16:9 (wide banner)',
    maxBytes: MAX_UPLOAD_BYTES,
    maxWidth: 2400,
    note: 'A wide, cinematic photograph. Keep the subject slightly right of centre so the headline stays readable.',
  },
  featured: {
    label: 'Featured story image',
    width: 1200,
    height: 675,
    ratio: '16:9',
    maxBytes: MAX_UPLOAD_BYTES,
    maxWidth: 1800,
    note: 'Used for the highlighted story on the homepage.',
  },
  article: {
    label: 'Journal / article image',
    width: 1200,
    height: 675,
    ratio: '16:9',
    maxBytes: MAX_UPLOAD_BYTES,
    maxWidth: 1800,
    note: 'Shown on the article card, the journal archive and the top of the article page.',
  },
  about: {
    label: 'About section image',
    width: 800,
    height: 600,
    ratio: '4:3',
    maxBytes: MAX_UPLOAD_BYTES,
    maxWidth: 1600,
    note: 'A portrait-style photograph works best here.',
  },
  footer: {
    label: 'Footer background image',
    width: 1920,
    height: 300,
    ratio: '~6.4:1',
    maxBytes: MAX_UPLOAD_BYTES,
    maxWidth: 2400,
    note: 'A dark, low-contrast image keeps the footer text readable.',
  },
  general: {
    label: 'Image',
    width: 1600,
    height: 900,
    ratio: 'any',
    maxBytes: MAX_UPLOAD_BYTES,
    maxWidth: 1800,
    note: 'General purpose image for the media library.',
  },
};

export const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp';

export function describeSpec(purpose: ImagePurpose): string[] {
  const spec = IMAGE_SPECS[purpose];
  return [
    `Recommended size: ${spec.width} × ${spec.height} px`,
    `Aspect ratio: ${spec.ratio}`,
    `Max file size: ${Math.round(spec.maxBytes / (1024 * 1024))} MB`,
    'Format: JPG, PNG or WebP',
  ];
}
