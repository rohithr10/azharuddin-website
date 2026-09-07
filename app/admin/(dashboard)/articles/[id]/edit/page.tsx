import { notFound } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';
import { dbConnect } from '@/lib/db';
import { Article } from '@/lib/models';
import { getCategories, serializeArticle } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await dbConnect();
  const doc = await Article.findById(id).populate('category').lean().catch(() => null);
  if (!doc) notFound();

  const [article, categories] = [serializeArticle(doc), await getCategories()];

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">Edit Article</h1>
          <p className="a-subtitle">
            Changes appear on the website as soon as you save a published article.
          </p>
        </div>
      </div>

      <ArticleForm article={article} categories={categories} />
    </>
  );
}
