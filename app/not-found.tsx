import Link from 'next/link';

export default function NotFound() {
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
          Error 404
        </p>
        <h1 className="display-lg" style={{ marginTop: '1rem' }}>
          This page could not be found.
        </h1>
        <p className="lede" style={{ margin: '1.25rem auto 2.5rem' }}>
          The page you are looking for may have been moved, or never existed.
        </p>
        <Link href="/" className="btn btn--outline-dark">
          Return Home
        </Link>
      </div>
    </main>
  );
}
