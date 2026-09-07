import Link from 'next/link';
import ArticleForm from '@/components/admin/ArticleForm';
import { getCategories } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const categories = await getCategories();

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">Add New Article</h1>
          <p className="a-subtitle">
            Publish straight away with “Post Article”, or keep it private with “Save as Draft”.
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="a-empty">
          <p>You need at least one category before writing an article.</p>
          <p style={{ marginTop: '1rem' }}>
            <Link href="/admin/categories" className="a-btn a-btn--primary">
              Create a category
            </Link>
          </p>
        </div>
      ) : (
        <ArticleForm article={null} categories={categories} />
      )}
    </>
  );
}
