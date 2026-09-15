'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import ImageCropper from './ImageCropper';
import { ACCEPTED_EXTENSIONS, IMAGE_SPECS, type ImagePurpose } from '@/lib/image-specs';
import { prepareImageForUpload, validateImageFile } from '@/lib/client-image';

const PURPOSES: ImagePurpose[] = ['general', 'hero', 'featured', 'article', 'about', 'footer'];

export default function MediaUploader() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [purpose, setPurpose] = useState<ImagePurpose>('general');
  const [queue, setQueue] = useState<File[]>([]);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(0);
  const uploadedRef = useRef(0);

  function start(files: FileList) {
    const valid: File[] = [];
    const problems: string[] = [];
    for (const file of Array.from(files)) {
      const problem = validateImageFile(file);
      if (problem) problems.push(`${file.name}: ${problem}`);
      else valid.push(file);
    }

    uploadedRef.current = 0;
    setErrors(problems);
    setDone(0);
    setIndex(0);
    setQueue(valid);
    if (!valid.length && fileRef.current) fileRef.current.value = '';
  }

  function finish() {
    setQueue([]);
    setIndex(0);
    setDone(uploadedRef.current);
    if (fileRef.current) fileRef.current.value = '';
    router.refresh();
  }

  async function send(file: File, originalName: string) {
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('purpose', purpose);
      const response = await fetch('/api/admin/upload', { method: 'POST', body });
      const result = await response.json();
      if (!response.ok) {
        setErrors((list) => [...list, `${originalName}: ${result.error || 'upload failed'}`]);
      } else {
        uploadedRef.current += 1;
      }
    } catch (caught) {
      setErrors((list) => [
        ...list,
        `${originalName}: ${caught instanceof Error && caught.message ? caught.message : 'upload failed'}`,
      ]);
    }
  }

  async function advance(work: () => Promise<void>) {
    setBusy(true);
    await work();
    setBusy(false);
    if (index + 1 < queue.length) setIndex(index + 1);
    else finish();
  }

  const current = queue[index];

  const handleCropped = (cropped: File) =>
    advance(() => send(cropped, current.name));

  const handleSkip = () =>
    advance(async () => {
      try {
        const { file } = await prepareImageForUpload(current, purpose);
        await send(file, current.name);
      } catch (caught) {
        setErrors((list) => [
          ...list,
          `${current.name}: ${caught instanceof Error ? caught.message : 'upload failed'}`,
        ]);
      }
    });

  // Cancelling stops the batch; anything already uploaded stays.
  const handleCancel = useCallback(() => {
    setQueue([]);
    setIndex(0);
    setDone(uploadedRef.current);
    if (fileRef.current) fileRef.current.value = '';
    if (uploadedRef.current) router.refresh();
  }, [router]);

  const spec = IMAGE_SPECS[purpose];

  return (
    <div className="a-panel">
      <h2 className="a-panel-title">Upload images</h2>
      <p className="a-panel-note">
        Each photo opens in a cropper so you can frame it before it is saved. Large photos are
        compressed automatically.
      </p>

      {errors.map((message) => (
        <p key={message} className="a-notice a-notice--error" role="alert">
          {message}
        </p>
      ))}
      {done > 0 && !busy && !queue.length && (
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
            disabled={busy || queue.length > 0}
          >
            {PURPOSES.map((value) => (
              <option key={value} value={value}>
                {IMAGE_SPECS[value].label}
              </option>
            ))}
          </select>
          <span className="a-hint">
            {spec.fixed
              ? `Cropped to ${spec.width} × ${spec.height} px (${spec.ratio})`
              : 'Choose any shape while cropping'}{' '}
            · photos up to 30 MB are compressed automatically · JPG, PNG or WebP
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
            disabled={busy || queue.length > 0}
            onChange={(event) => {
              if (event.target.files?.length) start(event.target.files);
            }}
          />
          <span className="a-hint" role="status">
            {busy
              ? `Uploading ${index + 1} of ${queue.length}…`
              : 'You can select several at once — each one is cropped in turn.'}
          </span>
        </div>
      </div>

      {current && !busy && (
        <ImageCropper
          file={current}
          purpose={purpose}
          position={{ index: index + 1, total: queue.length }}
          onCancel={handleCancel}
          onSkip={handleSkip}
          onCropped={handleCropped}
        />
      )}
    </div>
  );
}
