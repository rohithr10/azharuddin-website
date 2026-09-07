import type { Metadata } from 'next';
import PageIntro from '@/components/site/PageIntro';
import SectionBlocks from '@/components/site/SectionBlocks';
import Reveal from '@/components/ui/Reveal';
import { getPage } from '@/lib/data';
import styles from './media.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('media');
  return {
    title: page?.seoTitle || page?.title || 'Media',
    description: page?.seoDescription || page?.intro,
    alternates: { canonical: '/media' },
  };
}

export default async function MediaPage() {
  const page = await getPage('media');

  return (
    <>
      <PageIntro
        eyebrow={page?.eyebrow || 'Media'}
        title={page?.title || 'Features, talks and appearances'}
        intro={page?.intro || 'Selected coverage, conversations and public appearances.'}
        image={page?.image}
      />

      <section className="section">
        <div className="container">
          {page?.body && (
            <Reveal className={styles.body}>
              <div className="prose" dangerouslySetInnerHTML={{ __html: page.body }} />
            </Reveal>
          )}

          {page?.sections?.length ? (
            <div className={styles.list}>
              <h2 className="visually-hidden">Media features</h2>
              <SectionBlocks sections={page.sections} variant="media" />
            </div>
          ) : (
            <p className={styles.empty}>
              Media features will be published here soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
