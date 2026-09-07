import Image from 'next/image';
import Link from 'next/link';
import styles from './ArticleCard.module.css';
import DateBadge from './DateBadge';
import { ArrowRight } from '@/components/ui/icons';
import { PLACEHOLDER, withFallback } from '@/lib/placeholders';
import type { ArticleView } from '@/lib/types';

type Props = {
  article: ArticleView;
  showExcerpt?: boolean;
  sizes?: string;
};

export default function ArticleCard({ article, showExcerpt = false, sizes }: Props) {
  return (
    <article className={styles.card}>
      <Link href={`/journal/${article.slug}`} aria-label={article.title}>
        <div className={styles.media}>
          <Image
            src={withFallback(article.image, PLACEHOLDER.article)}
            alt={article.imageAlt || article.title}
            width={800}
            height={500}
            sizes={sizes ?? '(max-width: 640px) 86vw, (max-width: 1024px) 45vw, 30vw'}
          />
          <DateBadge date={article.publishedAt ?? article.createdAt} placement="top-left" />
        </div>
      </Link>

      <div className={styles.body}>
        <span className={styles.category}>{article.category?.name ?? 'Journal'}</span>
        <h3 className={styles.title}>
          <Link href={`/journal/${article.slug}`}>{article.title}</Link>
        </h3>
        {showExcerpt && article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
        <div className={styles.footer}>
          <Link href={`/journal/${article.slug}`} className="link-arrow link-arrow--muted">
            Read Article
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
