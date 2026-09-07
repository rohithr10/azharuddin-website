'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './JournalRail.module.css';
import ArticleCard from './ArticleCard';
import { ArrowLeft, ArrowRight } from '@/components/ui/icons';
import type { ArticleView } from '@/lib/types';

/**
 * Three cards on desktop, two on tablet, a swipeable rail on phones.
 * The arrows page by one card and are removed from the tab order when
 * everything already fits on screen.
 */
export default function JournalRail({ articles }: { articles: ArticleView[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  const sync = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setOverflowing(max > 8);
    setCanPrev(node.scrollLeft > 8);
    setCanNext(node.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    sync();
    node.addEventListener('scroll', sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => {
      node.removeEventListener('scroll', sync);
      observer.disconnect();
    };
  }, [sync, articles.length]);

  const page = (direction: 1 | -1) => {
    const node = scrollerRef.current;
    if (!node) return;

    const firstCard = node.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(getComputedStyle(node).columnGap) || 24;
    const step = firstCard ? firstCard.offsetWidth + gap : node.clientWidth * 0.8;

    const target = Math.max(
      0,
      Math.min(node.scrollLeft + step * direction, node.scrollWidth - node.clientWidth)
    );

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    node.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <section className={styles.section} aria-labelledby="journal-heading">
      <div className="container">
        <div className={styles.head}>
          <h2 id="journal-heading" className="eyebrow eyebrow--rule">
            From the Journal
          </h2>
          <Link href="/journal" className="link-arrow link-arrow--muted">
            View All Articles
            <ArrowRight size={15} />
          </Link>
        </div>

        {articles.length === 0 ? (
          <p className={styles.empty}>
            The first journal entries are on their way. Please check back soon.
          </p>
        ) : (
          <div className={styles.wrap}>
            {overflowing && (
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowPrev}`}
                onClick={() => page(-1)}
                disabled={!canPrev}
                aria-label="Previous articles"
              >
                <ArrowLeft size={17} />
              </button>
            )}

            <div className={styles.scroller} ref={scrollerRef} tabIndex={0} aria-label="Journal articles">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {overflowing && (
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowNext}`}
                onClick={() => page(1)}
                disabled={!canNext}
                aria-label="More articles"
              >
                <ArrowRight size={17} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
