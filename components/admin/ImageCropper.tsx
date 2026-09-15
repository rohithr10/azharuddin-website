'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import type { Area, MediaSize, Point } from 'react-easy-crop';
import { IMAGE_SPECS, type ImagePurpose } from '@/lib/image-specs';
import { cropImage } from '@/lib/client-image';

type Props = {
  file: File;
  purpose: ImagePurpose;
  /** Shown when cropping several photos in a row. */
  position?: { index: number; total: number };
  onCancel: () => void;
  onSkip: () => void;
  onCropped: (file: File) => void;
};

/** Shape presets for the media library, where no size is imposed. 0 = the photo's own shape. */
const SHAPES = [
  { label: 'Original', value: 0 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '1:1', value: 1 },
  { label: '3:4', value: 3 / 4 },
];

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/**
 * Lets the admin frame a photo before it is uploaded. Slots with a fixed size
 * lock the crop to that exact shape, so what they see is what the site shows.
 */
export default function ImageCropper({ file, purpose, position, onCancel, onSkip, onCropped }: Props) {
  const spec = IMAGE_SPECS[purpose];
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  // The preview URL is created and revoked by the same effect. Creating it
  // during render and revoking it in a cleanup breaks under React's
  // mount → unmount → remount in development: the image would load a URL that
  // had already been revoked.
  const [src, setSrc] = useState('');
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [shape, setShape] = useState(0);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sideways = rotation % 180 !== 0;
  const aspect = spec.fixed
    ? spec.width / spec.height
    : shape === 0
      ? natural
        ? sideways
          ? natural.height / natural.width
          : natural.width / natural.height
        : 4 / 3
      : shape;

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);
  const onMediaLoaded = useCallback(
    (media: MediaSize) => setNatural({ width: media.naturalWidth, height: media.naturalHeight }),
    []
  );

  // A new photo starts from a clean slate.
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setShape(0);
    setArea(null);
    setError('');
  }, [file]);

  // Modal behaviour: lock page scroll, focus the dialog, trap Tab, Escape cancels,
  // and hand focus back to whatever opened it.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add('no-scroll');
    dialogRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      previous?.focus?.();
    };
  }, [busy, onCancel]);

  function reset() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setShape(0);
  }

  async function confirm() {
    if (!area) return;
    setBusy(true);
    setError('');
    try {
      onCropped(await cropImage(file, area, rotation, purpose));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The image could not be cropped.');
      setBusy(false);
    }
  }

  const tooSmall = spec.fixed && area !== null && area.width < spec.width;
  const savedAs = spec.fixed
    ? `${spec.width} × ${spec.height} px`
    : area
      ? `${Math.min(area.width, spec.width)} × ${Math.round(area.height * Math.min(1, spec.width / area.width))} px`
      : '—';

  const isLast = !position || position.index >= position.total;

  const dialog = (
    <div className="a-cropper-backdrop">
      <div
        ref={dialogRef}
        className="a-cropper"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="a-cropper-head">
          <div>
            <h2 id={titleId} className="a-panel-title" style={{ marginBottom: '0.2rem' }}>
              Crop image{position && position.total > 1 ? ` — ${position.index} of ${position.total}` : ''}
            </h2>
            <p className="a-hint">
              Drag the photo to position it, and zoom with the slider or your scroll wheel.{' '}
              {spec.fixed
                ? `The frame is locked to the shape of the ${spec.label.toLowerCase()} — ${spec.width} × ${spec.height} px, ${spec.ratio}.`
                : 'Choose a shape below.'}
            </p>
          </div>
          <button
            type="button"
            className="a-btn a-btn--ghost"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cancel and close"
          >
            ✕
          </button>
        </div>

        <div className="a-cropper-stage">
          {src && (
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            zoomSpeed={0.2}
            showGrid
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onMediaLoaded={onMediaLoaded}
          />
          )}
        </div>

        <div className="a-cropper-controls">
          <div className="a-cropper-group">
            <span className="a-label" id={`${titleId}-zoom`}>
              Zoom
            </span>
            <button
              type="button"
              className="a-tool"
              onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.2).toFixed(2)))}
              aria-label="Zoom out"
              disabled={busy}
            >
              −
            </button>
            <input
              type="range"
              className="a-cropper-zoom"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              aria-labelledby={`${titleId}-zoom`}
              aria-valuetext={`${Math.round(zoom * 100)}%`}
              disabled={busy}
            />
            <button
              type="button"
              className="a-tool"
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.2).toFixed(2)))}
              aria-label="Zoom in"
              disabled={busy}
            >
              +
            </button>
          </div>

          <div className="a-cropper-group">
            <span className="a-label">Rotate</span>
            <button
              type="button"
              className="a-tool"
              onClick={() => setRotation((r) => (r + 270) % 360)}
              aria-label="Rotate left"
              disabled={busy}
            >
              ↺
            </button>
            <button
              type="button"
              className="a-tool"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              aria-label="Rotate right"
              disabled={busy}
            >
              ↻
            </button>
          </div>

          {!spec.fixed && (
            <div className="a-cropper-group" role="group" aria-label="Crop shape">
              <span className="a-label">Shape</span>
              {SHAPES.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className="a-chip"
                  aria-pressed={shape === option.value}
                  onClick={() => setShape(option.value)}
                  disabled={busy}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <button type="button" className="a-btn a-btn--ghost" onClick={reset} disabled={busy}>
            Reset
          </button>
        </div>

        <div className="a-cropper-meta" aria-live="polite">
          <span>
            Selected area: <strong>{area ? `${area.width} × ${area.height} px` : '—'}</strong>
          </span>
          <span>
            Saved as: <strong>{savedAs}</strong>
          </span>
          {tooSmall && (
            <span className="a-cropper-warning">
              This selection is smaller than {spec.width} × {spec.height} px, so it will be enlarged
              and may look soft. Zoom out for a sharper result.
            </span>
          )}
        </div>

        {error && (
          <p className="a-notice a-notice--error" role="alert" style={{ margin: '0 1.35rem 1rem' }}>
            {error}
          </p>
        )}

        <div className="a-cropper-foot">
          <button type="button" className="a-btn a-btn--ghost" onClick={onSkip} disabled={busy}>
            {spec.fixed ? 'Skip — crop the centre automatically' : 'Skip — upload as it is'}
          </button>
          <span className="a-cropper-spacer" />
          <button type="button" className="a-btn a-btn--secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={confirm}
            disabled={!area || busy}
          >
            {busy ? 'Cropping…' : isLast ? 'Crop & upload' : 'Crop & continue'}
          </button>
        </div>
      </div>
    </div>
  );

  // Render inside the admin root so the CMS colour variables still apply.
  const host = document.querySelector('.a-body') ?? document.body;
  return createPortal(dialog, host);
}
