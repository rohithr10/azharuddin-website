import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageIntro from '@/components/site/PageIntro';
import SectionBlocks from '@/components/site/SectionBlocks';
import PhilosophyBand from '@/components/site/PhilosophyBand';
import Reveal from '@/components/ui/Reveal';
import { ArrowRight } from '@/components/ui/icons';
import { getPage, getSettings } from '@/lib/data';
import { PLACEHOLDER, withFallback } from '@/lib/placeholders';
import styles from './about.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('about-me');
  return {
    title: page?.seoTitle || page?.title || 'About Me',
    description: page?.seoDescription || page?.intro,
    alternates: { canonical: '/about-me' },
  };
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPage('about-me'), getSettings()]);

  return (
    <>
      <PageIntro
        eyebrow={page?.eyebrow || 'About Azharuddin'}
        title={page?.title || 'A life of purpose. A legacy of impact.'}
        intro={page?.intro || settings.aboutText}
        image={page?.image}
      />

      <section className="section">
        <div className="container">
          <div className={styles.lead}>
            <Reveal className={styles.leadMedia}>
              <Image
                src={withFallback(settings.aboutImage, PLACEHOLDER.about)}
                alt={`${settings.siteName || 'Azharuddin'} portrait`}
                width={900}
                height={1100}
                sizes="(max-width: 900px) 100vw, 42vw"
              />
            </Reveal>
            <Reveal className={styles.leadBody} delay={80}>
              {page?.body ? (
                <div className="prose" dangerouslySetInnerHTML={{ __html: page.body }} />
              ) : (
                <div className="prose">
                  <p>{settings.aboutText}</p>
                </div>
              )}
              <div className={styles.leadCta}>
                <Link href="/journal" className="link-arrow link-arrow--muted">
                  Read the Journal
                  <ArrowRight size={15} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {page?.sections?.length ? (
        <section className={styles.values}>
          <div className="container">
            <SectionBlocks sections={page.sections} variant="alternating" />
          </div>
        </section>
      ) : null}

      <PhilosophyBand quote={settings.philosophyQuote} />
    </>
  );
}
