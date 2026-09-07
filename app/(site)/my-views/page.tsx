import type { Metadata } from 'next';
import Link from 'next/link';
import PageIntro from '@/components/site/PageIntro';
import SectionBlocks from '@/components/site/SectionBlocks';
import ArticleCard from '@/components/site/ArticleCard';
import Reveal from '@/components/ui/Reveal';
import { ArrowRight } from '@/components/ui/icons';
import { getPage, getPublishedArticles } from '@/lib/data';
import styles from './views.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('my-views');
  return {
    title: page?.seoTitle || page?.title || 'My Views',
    description: page?.seoDescription || page?.intro,
    alternates: { canonical: '/my-views' },
  };
}

export default async function MyViewsPage() {
  const [page, articles] = await Promise.all([getPage('my-views'), getPublishedArticles(3)]);

  return (
    <>
      <PageIntro
        eyebrow={page?.eyebrow || 'My Views'}
        title={page?.title || 'What I believe, and why'}
        intro={
          page?.intro ||
          'A set of convictions shaped by people, places and the responsibility we all carry.'
        }
        image={page?.image}
      />

      {page?.body && (
        <section className="section">
          <div className="container">
            <Reveal className={styles.body}>
              <div className="prose" dangerouslySetInnerHTML={{ __html: page.body }} />
            </Reveal>
          </div>
        </section>
      )}

      {page?.sections?.length ? (
        <section className={styles.pillars} aria-labelledby="viewpoints-heading">
          <div className="container">
            <h2 id="viewpoints-heading" className="visually-hidden">
              Viewpoints
            </h2>
            <SectionBlocks sections={page.sections} variant="cards" />
          </div>
        </section>
      ) : null}

      {articles.length > 0 && (
        <section className="section">
          <div className="container">
            <div className={styles.head}>
              <h2 className="eyebrow eyebrow--rule">Recent Writing</h2>
              <Link href="/journal" className="link-arrow link-arrow--muted">
                View All Articles
                <ArrowRight size={15} />
              </Link>
            </div>
            <div className={styles.grid}>
              {articles.map((article, index) => (
                <Reveal key={article.id} delay={index * 70}>
                  <ArticleCard article={article} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
