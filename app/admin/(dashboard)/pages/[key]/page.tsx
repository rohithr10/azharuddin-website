import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageEditor from '@/components/admin/PageEditor';
import { getPage } from '@/lib/data';

export const dynamic = 'force-dynamic';

const ALLOWED: Record<string, { name: string; path: string }> = {
  'about-me': { name: 'About Me', path: '/about-me' },
  'my-views': { name: 'My Views', path: '/my-views' },
  journal: { name: 'Journal', path: '/journal' },
  media: { name: 'Media', path: '/media' },
  contact: { name: 'Contact', path: '/contact' },
};

export default async function EditPagePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const meta = ALLOWED[key];
  if (!meta) notFound();

  const page = await getPage(key);

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">{meta.name}</h1>
          <p className="a-subtitle">
            Everything on this page can be edited here — no code required.
          </p>
        </div>
        <div className="a-actions">
          <Link href="/admin/pages" className="a-btn a-btn--ghost">
            Back
          </Link>
          <Link
            href={meta.path}
            target="_blank"
            rel="noopener noreferrer"
            className="a-btn a-btn--secondary"
          >
            View page ↗
          </Link>
        </div>
      </div>

      <PageEditor page={page} pageKey={key} />
    </>
  );
}
