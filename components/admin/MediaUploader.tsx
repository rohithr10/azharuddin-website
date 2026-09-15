'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { ACCEPTED_EXTENSIONS, IMAGE_SPECS, type ImagePurpose } from '@/lib/image-specs';
import { prepareImageForUpload } from '@/lib/client-image';

const PURPOSES: ImagePurpose[] = ['general', 'hero', 'featured', 'article', 'about', 'footer'];

export default function MediaUploader() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [purpose, setPurpose] = useState<ImagePurpose>('general');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(0);

  async function upload(files: FileList) {
    setBusy(true);
    setError('');
    let uploaded = 0;

    for (const original of Array.from(files)) {
      try {
        const { file } = await prepareImageForUpload(original, purpose);
        const body = new FormData();
        body.append('file', file);
        body.append('purpose', purpose);

        const response = await fetch('/api/admin/upload', { method: 'POST', body });
        const result = await response.json();
        if (!response.ok) {
          setError(`${original.name}: ${result.error || 'upload failed'}`);
        } else {
          uploaded += 1;
        }
      } catch (caught) {
        setError(
          `${original.name}: ${caught instanceof Error && caught.message ? caught.message : 'upload failed'}`
        );
      }
    }

    setBusy(false);
    setDone(uploaded);
    if (fileRef.current) fileRef.current.value = '';
    router.refresh();
  }

  const spec = IMAGE_SPECS[purpose];

  return (
    <div className="a-panel">
      <h2 className="a-panel-title">Upload images</h2>
      <p className="a-panel-note">
        Images are resized and compressed automatically, so large photographs are fine.
      </p>

      {error && (
        <p className="a-notice a-notice--error" role="alert">
          {error}
        </p>
      )}
      {done > 0 && !busy && (
        <p className="a-notice a-notice--success" role="status">
          {done} image{done === 1 ? '' : 's'} uploaded.
        </p>
      )}

      <div className="a-row">
        <div className="a-field">
          <label className="a-label" htmlFor="media-purpose">
            What is this image for?
          </label>
          <select
            id="media-purpose"
            className="a-select"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value as ImagePurpose)}
          >
            {PURPOSES.map((value) => (
              <option key={value} value={value}>
                {IMAGE_SPECS[value].label}
              </option>
            ))}
          </select>
          <span className="a-hint">
            Recommended: {spec.width} × {spec.height} px ({spec.ratio}) ·{' '}
            photos up to 30 MB are compressed automatically · JPG, PNG or WebP
          </span>
        </div>

        <div className="a-field">
          <span className="a-label">Choose files</span>
          <input
            ref={fileRef}
            type="file"
            className="a-input"
            accept={ACCEPTED_EXTENSIONS}
            multiple
            disabled={busy}
            onChange={(event) => {
              if (event.target.files?.length) upload(event.target.files);
            }}
          />
          <span className="a-hint">{busy ? 'Uploading…' : 'You can select several at once.'}</span>
        </div>
      </div>
    </div>
  );
}
