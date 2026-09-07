import Link from 'next/link';
import FeaturedStoryPicker from '@/components/admin/FeaturedStoryPicker';
import { dbConnect } from '@/lib/db';
import { Settings } from '@/lib/models';
import { getPublishedArticles } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function FeaturedStoryPage() {
  await dbConnect();
  const [articles, settings] = await Promise.all([
    getPublishedArticles(),
    Settings.findOne({ singleton: 'site' }).lean(),
  ]);

  const currentId = (settings as any)?.featuredArticle
    ? String((settings as any).featuredArticle)
    : null;

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">Featured Story</h1>
          <p className="a-subtitle">
            Choose which published article appears in the large Featured Story section on the
            homepage. Its image, title, category, date and description all update automatically.
          </p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="a-empty">
          <p>You need at least one published article before you can feature one.</p>
          <p style={{ marginTop: '1rem' }}>
            <Link href="/admin/articles/new" className="a-btn a-btn--primary">
              Write an article
            </Link>
          </p>
        </div>
      ) : (
        <FeaturedStoryPicker articles={articles} currentId={currentId} />
      )}
    </>
  );
}
