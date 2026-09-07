'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in the hosting platform's runtime logs.
    console.error('Page failed to render:', error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: '80vh',
        display: 'grid',
        placeItems: 'center',
        padding: '6rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '46rem' }}>
        <p className="eyebrow" style={{ justifyContent: 'center' }}>
          Something went wrong
        </p>
        <h1 className="display-lg" style={{ marginTop: '1rem' }}>
          We could not load this page.
        </h1>
        <p className="lede" style={{ margin: '1.25rem auto 2rem' }}>
          This usually means the site cannot reach its database. Open{' '}
          <a href="/api/health" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>
            /api/health
          </a>{' '}
          for a diagnosis of exactly what is missing.
        </p>

        {error?.digest && (
          <p
            style={{
              margin: '0 auto 2rem',
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
            }}
          >
            Error reference: <code>{error.digest}</code> — search this in your hosting
            platform’s runtime logs for the full message.
          </p>
        )}

        <button type="button" className="btn btn--outline-dark" onClick={reset}>
          Try Again
        </button>
      </div>
    </main>
  );
}
