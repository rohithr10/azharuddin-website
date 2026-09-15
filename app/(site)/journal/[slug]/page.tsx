import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './article.module.css';
import ArticleCard from '@/components/site/ArticleCard';
import ShareRow from '@/components/site/ShareRow';
import Reveal from '@/components/ui/Reveal';
import { ArrowLeft, ArrowRight } from '@/components/ui/icons';
import { getAdjacentArticles, getArticleBySlug, getSettings } from '@/lib/data';
import { PLACEHOLDER, withFallback } from '@/lib/placeholders';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Article not found' };

  const description = article.seoDescription || article.excerpt;

  return {
    title: article.seoTitle || article.title,
    description,
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.seoTitle || article.title,
      description,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      images: article.image ? [article.image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [settings, { previous, next }] = await Promise.all([
    getSettings(),
    getAdjacentArticles(article.publishedAt, article.id),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const articleUrl = `${siteUrl}/journal/${article.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.seoDescription || article.excerpt,
    image: article.image ? `${siteUrl}${article.image}` : undefined,
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt,
    articleSection: article.category?.name,
    author: { '@type': 'Person', name: settings.siteName || 'Azharuddin' },
    publisher: { '@type': 'Person', name: settings.siteName || 'Azharuddin' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className={styles.masthead}>
        <div className="container">
          <div className={styles.mastheadInner}>
            <p className={styles.meta}>
              <span className={styles.category}>{article.category?.name ?? 'Journal'}</span>
              <span aria-hidden>·</span>
              <time dateTime={article.publishedAt ?? undefined}>
                {formatDate(article.publishedAt)}
              </time>
              <span aria-hidden>·</span>
              <span>{article.readingMinutes} min read</span>
            </p>
            <h1 className={styles.title}>{article.title}</h1>
          </div>
        </div>
      </header>

      {/* Shown at its stored 16:9 shape, so the whole photo is visible on any screen. */}
      <div className="container">
        <figure className={styles.figure}>
          <Image
            src={withFallback(article.image, PLACEHOLDER.article)}
            alt={article.imageAlt || article.title}
            fill
            priority
            sizes="(max-width: 1240px) 100vw, 1144px"
            style={{ objectFit: 'cover' }}
          />
        </figure>
      </div>

      <div className="container">
        <div className={styles.layout}>
          <div className={styles.body}>
            {article.excerpt && <p className={styles.standfirst}>{article.excerpt}</p>}
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className={styles.foot}>
              <Link href="/journal" className="link-arrow link-arrow--muted">
                <ArrowLeft size={15} />
                Back to Journal
              </Link>
              <ShareRow url={articleUrl} title={article.title} />
            </div>
          </div>
        </div>
      </div>

      {(previous || next) && (
        <section className={styles.more} aria-label="More from the journal">
          <div className="container">
            <p className="eyebrow eyebrow--rule">Continue Reading</p>
            <div className={styles.moreGrid}>
              {previous && (
                <Reveal>
                  <ArticleCard article={previous} showExcerpt sizes="(max-width: 900px) 100vw, 45vw" />
                </Reveal>
              )}
              {next && (
                <Reveal delay={80}>
                  <ArticleCard article={next} showExcerpt sizes="(max-width: 900px) 100vw, 45vw" />
                </Reveal>
              )}
            </div>
            <div className={styles.moreLink}>
              <Link href="/journal" className="link-arrow link-arrow--muted">
                View All Articles
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
