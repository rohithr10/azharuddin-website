import type { Metadata } from 'next';
import PageIntro from '@/components/site/PageIntro';
import ArticleCard from '@/components/site/ArticleCard';
import Reveal from '@/components/ui/Reveal';
import { getCategories, getPage, getPublishedArticles } from '@/lib/data';
import styles from './journal.module.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Essays and reflections on life, leadership, nature and humanity.',
  alternates: { canonical: '/journal' },
};

type Props = { searchParams: Promise<{ category?: string }> };

export default async function JournalPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const [articles, categories, page] = await Promise.all([
    getPublishedArticles(),
    getCategories(),
    getPage('journal'),
  ]);

  const activeCategory = category?.toLowerCase();
  const visible = activeCategory
    ? articles.filter((article) => article.category?.slug === activeCategory)
    : articles;

  const usedCategories = categories.filter((c) =>
    articles.some((article) => article.category?.id === c.id)
  );

  return (
    <>
      <PageIntro
        eyebrow={page?.eyebrow || 'The Journal'}
        title={page?.title || 'Thoughts, written down'}
        intro={
          page?.intro ||
          'Reflections on life, leadership, nature and the responsibility we share for a kinder tomorrow.'
        }
        image={page?.image}
      />

      <section className="section" aria-labelledby="journal-list-heading">
        <div className="container">
          <h2 id="journal-list-heading" className="visually-hidden">
            {activeCategory ? `Articles in ${activeCategory}` : 'All articles'}
          </h2>

          {usedCategories.length > 0 && (
            <nav className={styles.filters} aria-label="Filter by category">
              <Link
                href="/journal"
                className={styles.filter}
                data-active={!activeCategory ? 'true' : 'false'}
              >
                All
              </Link>
              {usedCategories.map((item) => (
                <Link
                  key={item.id}
                  href={`/journal?category=${item.slug}`}
                  className={styles.filter}
                  data-active={activeCategory === item.slug ? 'true' : 'false'}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {visible.length === 0 ? (
            <p className={styles.empty}>
              No articles have been published in this category yet.
            </p>
          ) : (
            <div className={styles.grid}>
              {visible.map((article, index) => (
                <Reveal key={article.id} delay={Math.min(index, 5) * 70}>
                  <ArticleCard article={article} showExcerpt />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
