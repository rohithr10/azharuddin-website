import type { Metadata } from 'next';
import LoginForm from './LoginForm';
import '../admin.css';
import styles from './login.module.css';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.head}>
          <p className={styles.brand}>AZHARUDDIN</p>
          <p className={styles.sub}>Content Manager</p>
        </div>
        <LoginForm next={next} />
      </div>
      <p className={styles.foot}>
        Only the site owner can sign in here. Return to the{' '}
        <a href="/">public website</a>.
      </p>
    </div>
  );
}
