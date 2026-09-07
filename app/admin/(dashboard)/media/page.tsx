import MediaUploader from '@/components/admin/MediaUploader';
import ConfirmSubmit from '@/components/admin/ConfirmSubmit';
import CopyButton from '@/components/admin/CopyButton';
import { getMediaLibrary, getMediaUsage } from '@/lib/data';
import { deleteMediaAction } from '@/app/admin/actions';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const [media, usage] = await Promise.all([getMediaLibrary(), getMediaUsage()]);

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">Media Library</h1>
          <p className="a-subtitle">
            Every image uploaded to the website. An image still in use cannot be deleted.
          </p>
        </div>
      </div>

      <MediaUploader />

      {media.length === 0 ? (
        <p className="a-empty" style={{ marginTop: '1.25rem' }}>
          No images uploaded yet.
        </p>
      ) : (
        <div className="a-media-grid" style={{ marginTop: '1.25rem' }}>
          {media.map((item) => {
            const usedIn = usage[item.url] ?? [];
            return (
            <div className="a-media-card" key={item.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.alt || item.originalName} loading="lazy" />
              <div className="a-media-meta">
                <strong style={{ color: 'var(--a-ink)', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  {item.originalName || item.filename}
                </strong>
                <span>
                  {item.width} × {item.height} px · {(item.size / 1024).toFixed(0)} KB
                </span>
                <span>
                  {item.purpose} · {formatDate(item.createdAt)}
                </span>
                {usedIn.length > 0 && (
                  <span style={{ color: 'var(--a-success)' }}>
                    In use — {usedIn.join(', ')}
                  </span>
                )}
              </div>
              <div className="a-media-actions">
                <CopyButton value={item.url} />
                <form action={deleteMediaAction} style={{ marginLeft: 'auto' }}>
                  <input type="hidden" name="url" value={item.url} />
                  <ConfirmSubmit
                    message="Delete this image permanently?"
                    disabled={usedIn.length > 0}
                    title={
                      usedIn.length > 0
                        ? `Still used by: ${usedIn.join(', ')}. Replace or remove it there first.`
                        : undefined
                    }
                  >
                    Delete
                  </ConfirmSubmit>
                </form>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </>
  );
}
