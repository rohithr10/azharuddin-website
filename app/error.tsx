'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
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
      <div>
        <p className="eyebrow" style={{ justifyContent: 'center' }}>
          Something went wrong
        </p>
        <h1 className="display-lg" style={{ marginTop: '1rem' }}>
          We could not load this page.
        </h1>
        <p className="lede" style={{ margin: '1.25rem auto 2.5rem' }}>
          Please try again. If the problem continues, check that the database is running.
        </p>
        <button type="button" className="btn btn--outline-dark" onClick={reset}>
          Try Again
        </button>
      </div>
    </main>
  );
}
