import Image from 'next/image';
import Link from 'next/link';
import styles from './FeaturedStory.module.css';
import DateBadge from './DateBadge';
import Reveal from '@/components/ui/Reveal';
import { ArrowRight } from '@/components/ui/icons';
import { PLACEHOLDER, withFallback } from '@/lib/placeholders';
import type { ArticleView } from '@/lib/types';

export default function FeaturedStory({ article }: { article: ArticleView }) {
  return (
    <section className={styles.section} aria-labelledby="featured-heading">
      <div className="container">
        <div className={styles.grid}>
          <Reveal className={styles.order1}>
            <p className="eyebrow eyebrow--rule">Featured Story</p>
            <h2 id="featured-heading" className={styles.title}>
              {article.title}
            </h2>
            <hr className="rule-gold" />
            {article.excerpt && <p className={styles.text}>{article.excerpt}</p>}
            <div className={styles.cta}>
              <Link href={`/journal/${article.slug}`} className="link-arrow link-arrow--muted">
                Read Article
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          <Reveal className={styles.order2} delay={90}>
            <Link href={`/journal/${article.slug}`} aria-label={article.title}>
              <figure className={styles.figure}>
                <Image
                  src={withFallback(article.image, PLACEHOLDER.featured)}
                  alt={article.imageAlt || article.title}
                  width={1200}
                  height={750}
                  sizes="(max-width: 900px) 100vw, 60vw"
                />
                <DateBadge date={article.publishedAt} placement="top-right" />
              </figure>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
