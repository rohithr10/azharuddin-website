'use client';

import { useId, useRef, useState } from 'react';
import { ACCEPTED_EXTENSIONS, IMAGE_SPECS, type ImagePurpose } from '@/lib/image-specs';
import { prepareImageForUpload } from '@/lib/client-image';

type Props = {
  name: string;
  label: string;
  purpose: ImagePurpose;
  defaultValue?: string;
  altName?: string;
  defaultAlt?: string;
  onChange?: (url: string) => void;
};

/**
 * Upload → preview → replace → remove → upload again, with the recommended
 * dimensions shown right beside the field so the client never has to guess.
 */
export default function ImageField({
  name,
  label,
  purpose,
  defaultValue = '',
  altName,
  defaultAlt = '',
  onChange,
}: Props) {
  const spec = IMAGE_SPECS[purpose];
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<'optimising' | 'uploading'>('uploading');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  async function upload(original: File) {
    setBusy(true);
    setError('');

    try {
      // Large photos are compressed here first; small ones go up untouched.
      setPhase('optimising');
      const { file } = await prepareImageForUpload(original, purpose);

      setPhase('uploading');
      const body = new FormData();
      body.append('file', file);
      body.append('purpose', purpose);

      const response = await fetch('/api/admin/upload', { method: 'POST', body });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'The upload failed.');
        return;
      }

      setUrl(result.url);
      onChange?.(result.url);
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : 'The upload failed. Please try again.'
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function remove() {
    setUrl('');
    setError('');
    onChange?.('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="a-field">
      <span className="a-label">{label}</span>

      <div className="a-image-field">
        <div
          className="a-dropzone"
          data-dragging={dragging ? 'true' : 'false'}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) upload(file);
          }}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" />
          ) : (
            <p className="a-dropzone-hint">
{busy ? (phase === 'optimising' ? 'Optimising image…' : 'Uploading…') : 'Click “Upload image”, or drag a photo here'}
            </p>
          )}
        </div>

        <div>
          <ul className="a-spec-list">
            <li>
              <strong>{spec.fixed ? 'Required size' : 'Recommended size'}:</strong> {spec.width} ×{' '}
              {spec.height} px
            </li>
            <li>
              <strong>Aspect ratio:</strong> {spec.ratio}
            </li>
            <li>
              <strong>File size:</strong> any photo up to 30 MB — larger files are compressed
              automatically and saved under {Math.round(spec.maxBytes / (1024 * 1024))} MB
            </li>
            <li>
              <strong>Formats:</strong> JPG, PNG or WebP
            </li>
            {spec.fixed && (
              <li>
                Any photograph is automatically resized and centre-cropped to exactly{' '}
                {spec.width} × {spec.height} px, so the layout stays consistent.
              </li>
            )}
            <li>{spec.note}</li>
          </ul>

          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload(file);
            }}
          />

          <div className="a-actions">
            <button
              type="button"
              className="a-btn a-btn--secondary"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
{busy ? (phase === 'optimising' ? 'Optimising image…' : 'Uploading…') : url ? 'Replace image' : 'Upload image'}
            </button>
            {url && (
              <button type="button" className="a-btn a-btn--danger" onClick={remove} disabled={busy}>
                Remove image
              </button>
            )}
          </div>

          {error && (
            <p className="a-notice a-notice--error" style={{ marginTop: '0.85rem' }}>
              {error}
            </p>
          )}

          {altName && (
            <div className="a-field" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <label className="a-label" htmlFor={`${inputId}-alt`}>
                Image description (for screen readers and SEO)
              </label>
              <input
                id={`${inputId}-alt`}
                className="a-input"
                name={altName}
                defaultValue={defaultAlt}
                maxLength={200}
                placeholder="e.g. Azharuddin walking through a mountain valley at sunrise"
              />
            </div>
          )}
        </div>
      </div>

      <input type="hidden" name={name} value={url} />
    </div>
  );
}
