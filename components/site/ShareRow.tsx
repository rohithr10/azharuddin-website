'use client';

import { useState } from 'react';
import styles from './ShareRow.module.css';
import { LinkedInIcon, MailIcon } from '@/components/ui/icons';

export default function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.row}>
      <span className={styles.label}>Share</span>
      <a
        className={styles.button}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
      >
        <LinkedInIcon size={15} />
      </a>
      <a
        className={styles.button}
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.9 2H22l-7.1 8.1L23.2 22h-6.5l-5.1-6.6L5.8 22H2.7l7.6-8.7L1.5 2H8l4.6 6.1L18.9 2Zm-1.1 18h1.7L7.3 3.7H5.4L17.8 20Z" />
        </svg>
      </a>
      <a
        className={styles.button}
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        aria-label="Share by email"
      >
        <MailIcon size={15} />
      </a>
      <button type="button" className={styles.button} onClick={copy} aria-label="Copy link">
        {copied ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="m5 13 4 4L19 7" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
          </svg>
        )}
      </button>
      <span className="visually-hidden" role="status" aria-live="polite">
        {copied ? 'Link copied to clipboard' : ''}
      </span>
    </div>
  );
}
