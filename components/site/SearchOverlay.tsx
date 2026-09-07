'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styles from './SearchOverlay.module.css';
import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { PLACEHOLDER, withFallback } from '@/lib/placeholders';
import type { ArticleView } from '@/lib/types';

type Props = { open: boolean; onClose: () => void };

export default function SearchOverlay({ open, onClose }: Props) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<ArticleView[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Wait for the transition to start before stealing focus.
      const id = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(id);
    }
    setTerm('');
    setResults([]);
    setState('idle');
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      setResults([]);
      setState('idle');
      return;
    }

    setState('loading');
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setResults(Array.isArray(data.results) ? data.results : []);
        setState('done');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setState('done');
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [term]);

  return (
    <div
      className={styles.overlay}
      data-open={open ? 'true' : 'false'}
      role="dialog"
      aria-modal="true"
      aria-label="Search the journal"
      aria-hidden={!open}
      {...(!open ? { inert: true } : {})}
    >
      <div className={styles.top}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close search">
          <CloseIcon />
        </button>
      </div>

      <div className={styles.body}>
        <p className={styles.label}>Search the journal</p>

        <div className={styles.field}>
          <input
            ref={inputRef}
            type="search"
            className={styles.input}
            placeholder="What are you looking for?"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            aria-label="Search articles by title, category or content"
          />
          <span className={styles.fieldIcon}>
            <SearchIcon size={22} />
          </span>
        </div>

        <p className={styles.status} role="status" aria-live="polite">
          {state === 'idle' && 'Type at least two characters to search.'}
          {state === 'loading' && 'Searching…'}
          {state === 'done' &&
            (results.length
              ? `${results.length} article${results.length === 1 ? '' : 's'} found`
              : 'No articles matched that search.')}
        </p>

        {results.length > 0 && (
          <div className={styles.results}>
            {results.map((article) => (
              <Link key={article.id} href={`/journal/${article.slug}`} className={styles.result} onClick={onClose}>
                <div className={styles.thumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={withFallback(article.image, PLACEHOLDER.article)}
                    alt=""
                    loading="lazy"
                    width={216}
                    height={135}
                  />
                </div>
                <div>
                  <span className={styles.meta}>{article.category?.name ?? 'Journal'}</span>
                  <h3 className={styles.title}>{article.title}</h3>
                  {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
