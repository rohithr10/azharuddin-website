import Link from 'next/link';
import ConfirmSubmit from '@/components/admin/ConfirmSubmit';
import { dbConnect } from '@/lib/db';
import { Article, Settings } from '@/lib/models';
import { serializeArticle } from '@/lib/data';
import { deleteArticleAction, toggleArticleStatusAction } from '@/app/admin/actions';
import { PLACEHOLDER, withFallback } from '@/lib/placeholders';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ status?: string; saved?: string }> };

export default async function ArticlesPage({ searchParams }: Props) {
  const { status, saved } = await searchParams;

  await dbConnect();
  const filter = status === 'draft' || status === 'published' ? { status } : {};
  const [docs, settings] = await Promise.all([
    Article.find(filter).populate('category').sort({ updatedAt: -1 }).lean(),
    Settings.findOne({ singleton: 'site' }).lean(),
  ]);

  const articles = docs.map(serializeArticle);
  const featuredId = (settings as any)?.featuredArticle
    ? String((settings as any).featuredArticle)
    : null;

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">Journal Articles</h1>
          <p className="a-subtitle">
            {articles.length} article{articles.length === 1 ? '' : 's'}. There is no limit — add as
            many as you like.
          </p>
        </div>
        <Link href="/admin/articles/new" className="a-btn a-btn--primary">
          + Add New Article
        </Link>
      </div>

      {saved && (
        <p className="a-notice a-notice--success" role="status">
          Your article has been saved.
        </p>
      )}

      <div className="a-actions" style={{ marginBottom: '1.25rem' }}>
        <Link
          href="/admin/articles"
          className={`a-btn ${!status ? 'a-btn--primary' : 'a-btn--secondary'}`}
        >
          All
        </Link>
        <Link
          href="/admin/articles?status=published"
          className={`a-btn ${status === 'published' ? 'a-btn--primary' : 'a-btn--secondary'}`}
        >
          Published
        </Link>
        <Link
          href="/admin/articles?status=draft"
          className={`a-btn ${status === 'draft' ? 'a-btn--primary' : 'a-btn--secondary'}`}
        >
          Drafts
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="a-empty">
          <p>No articles here yet.</p>
          <p style={{ marginTop: '1rem' }}>
            <Link href="/admin/articles/new" className="a-btn a-btn--primary">
              Write your first article
            </Link>
          </p>
        </div>
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="a-thumb"
                      src={withFallback(article.image, PLACEHOLDER.article)}
                      alt=""
                    />
                  </td>
                  <td>
                    <Link href={`/admin/articles/${article.id}/edit`} className="a-cell-title">
                      {article.title}
                    </Link>
                    {featuredId === article.id && (
                      <div style={{ marginTop: '0.3rem' }}>
                        <span className="a-badge a-badge--featured">Featured</span>
                      </div>
                    )}
                  </td>
                  <td>{article.category?.name ?? '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatDate(article.publishedAt ?? article.createdAt)}
                  </td>
                  <td>
                    <span className={`a-badge a-badge--${article.status}`}>{article.status}</span>
                  </td>
                  <td>
                    <div className="a-cell-actions">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="a-btn a-btn--secondary"
                      >
                        Edit
                      </Link>

                      <form action={toggleArticleStatusAction}>
                        <input type="hidden" name="id" value={article.id} />
                        <button type="submit" className="a-btn a-btn--secondary">
                          {article.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                      </form>

                      <form action={deleteArticleAction}>
                        <input type="hidden" name="id" value={article.id} />
                        <ConfirmSubmit
                          message={`Delete “${article.title}”? This cannot be undone.`}
                        >
                          Delete
                        </ConfirmSubmit>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
