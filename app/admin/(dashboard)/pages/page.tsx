import Link from 'next/link';
import { dbConnect } from '@/lib/db';
import { Page } from '@/lib/models';

export const dynamic = 'force-dynamic';

const PAGES = [
  { key: 'about-me', name: 'About Me', path: '/about-me', note: 'Your personal story and values.' },
  { key: 'my-views', name: 'My Views', path: '/my-views', note: 'Your perspectives and convictions.' },
  { key: 'journal', name: 'Journal', path: '/journal', note: 'The heading above the article list.' },
  { key: 'media', name: 'Media', path: '/media', note: 'Features, talks and appearances.' },
  { key: 'contact', name: 'Contact', path: '/contact', note: 'How people can reach you.' },
];

export default async function PagesIndex() {
  await dbConnect();
  const existing = await Page.find().select('key title updatedAt').lean();
  const byKey = new Map(existing.map((page: any) => [page.key, page]));

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">Website Pages</h1>
          <p className="a-subtitle">
            The wording, images and sections on each page of the site — all editable here.
          </p>
        </div>
      </div>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Web address</th>
              <th>What it is</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {PAGES.map((page) => {
              const record = byKey.get(page.key) as any;
              return (
                <tr key={page.key}>
                  <td>
                    <Link href={`/admin/pages/${page.key}`} className="a-cell-title">
                      {page.name}
                    </Link>
                    {record?.title && (
                      <div style={{ color: 'var(--a-muted)', fontSize: '0.78rem' }}>
                        “{record.title}”
                      </div>
                    )}
                  </td>
                  <td style={{ color: 'var(--a-muted)' }}>{page.path}</td>
                  <td style={{ color: 'var(--a-muted)' }}>{page.note}</td>
                  <td>
                    <div className="a-cell-actions">
                      <Link href={`/admin/pages/${page.key}`} className="a-btn a-btn--secondary">
                        Edit
                      </Link>
                      <Link
                        href={page.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="a-btn a-btn--ghost"
                      >
                        View ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
