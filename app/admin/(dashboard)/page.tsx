import Link from 'next/link';
import { dbConnect } from '@/lib/db';
import { Article, Message } from '@/lib/models';
import { getDashboardStats, getFeaturedArticle, serializeArticle } from '@/lib/data';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await dbConnect();

  const [stats, featured, recentDocs, unread] = await Promise.all([
    getDashboardStats(),
    getFeaturedArticle(),
    Article.find().populate('category').sort({ updatedAt: -1 }).limit(5).lean(),
    Message.countDocuments({ read: false }),
  ]);

  const recent = recentDocs.map(serializeArticle);

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">Welcome back</h1>
          <p className="a-subtitle">
            Everything on the website can be changed from here — no code required.
          </p>
        </div>
        <Link href="/admin/articles/new" className="a-btn a-btn--primary">
          + Add New Article
        </Link>
      </div>

      <div className="a-stats">
        <div className="a-stat">
          <p className="a-stat-value">{stats.published}</p>
          <p className="a-stat-label">Published</p>
        </div>
        <div className="a-stat">
          <p className="a-stat-value">{stats.drafts}</p>
          <p className="a-stat-label">Drafts</p>
        </div>
        <div className="a-stat">
          <p className="a-stat-value">{stats.categories}</p>
          <p className="a-stat-label">Categories</p>
        </div>
        <div className="a-stat">
          <p className="a-stat-value">{stats.media}</p>
          <p className="a-stat-label">Images</p>
        </div>
        <div className="a-stat">
          <p className="a-stat-value">{unread}</p>
          <p className="a-stat-label">New messages</p>
        </div>
      </div>

      <div className="a-grid-2">
        <div className="a-panel">
          <h2 className="a-panel-title">Recently edited</h2>
          <p className="a-panel-note">The last five articles you worked on.</p>

          {recent.length === 0 ? (
            <p className="a-empty">No articles yet. Add your first one to get started.</p>
          ) : (
            <div className="a-table-wrap">
              <table className="a-table" style={{ minWidth: 'auto' }}>
                <tbody>
                  {recent.map((article) => (
                    <tr key={article.id}>
                      <td>
                        <Link href={`/admin/articles/${article.id}/edit`} className="a-cell-title">
                          {article.title}
                        </Link>
                        <div style={{ color: 'var(--a-muted)', fontSize: '0.78rem' }}>
                          {article.category?.name ?? 'Uncategorised'} ·{' '}
                          {formatDate(article.updatedAt)}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`a-badge a-badge--${article.status}`}>
                          {article.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="a-panel">
          <h2 className="a-panel-title">On the homepage now</h2>
          <p className="a-panel-note">This is the story shown in the Featured Story section.</p>

          {featured ? (
            <>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', lineHeight: 1.25 }}>
                {featured.title}
              </p>
              <p style={{ color: 'var(--a-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                {featured.category?.name ?? 'Uncategorised'} · published{' '}
                {formatDate(featured.publishedAt)}
              </p>
              <div className="a-actions" style={{ marginTop: '1.25rem' }}>
                <Link href="/admin/featured-story" className="a-btn a-btn--secondary">
                  Change featured story
                </Link>
                <Link
                  href={`/journal/${featured.slug}`}
                  target="_blank"
                  className="a-btn a-btn--ghost"
                >
                  View on site ↗
                </Link>
              </div>
            </>
          ) : (
            <p className="a-empty">
              Nothing is featured yet. Publish an article, then choose it under Featured Story.
            </p>
          )}
        </div>
      </div>

      <div className="a-panel">
        <h2 className="a-panel-title">Publishing an article</h2>
        <p className="a-panel-note">
          Add New Article → give it a title → choose a category → upload the image → write the
          content → “Post Article” to publish straight away, or “Save as Draft” to finish later.
          Published articles appear on the homepage and in the Journal automatically.
        </p>
        <div className="a-actions">
          <Link href="/admin/articles/new" className="a-btn a-btn--primary">
            + Add New Article
          </Link>
          <Link href="/admin/settings" className="a-btn a-btn--secondary">
            Change images &amp; social links
          </Link>
          <Link href="/admin/pages" className="a-btn a-btn--secondary">
            Edit website pages
          </Link>
        </div>
      </div>
    </>
  );
}
