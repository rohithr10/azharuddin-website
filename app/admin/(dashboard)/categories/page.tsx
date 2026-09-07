import CategoryManager from '@/components/admin/CategoryManager';
import { getCategories } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">Categories</h1>
          <p className="a-subtitle">
            Organise the journal. Every article belongs to one category, and visitors can filter by
            them.
          </p>
        </div>
      </div>

      <CategoryManager categories={categories} />
    </>
  );
}
