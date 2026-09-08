import Link from 'next/link';
import Image from 'next/image';
import styles from './SiteFooter.module.css';
import { InstagramIcon, LinkedInIcon, MailIcon } from '@/components/ui/icons';
import { mailtoUrl, safeUrl } from '@/lib/utils';
import type { SettingsView } from '@/lib/types';

export default function SiteFooter({ settings }: { settings: SettingsView }) {
  const linkedin = safeUrl(settings.linkedinUrl);
  const instagram = safeUrl(settings.instagramUrl);
  const email = mailtoUrl(settings.emailAddress);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {settings.footerImage && (
        <div className={styles.bg} aria-hidden>
          <Image
            src={settings.footerImage}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <div className={styles.scrim} aria-hidden />

      <div className={`container ${styles.top}`}>
        <Link href="/" className={styles.logo}>
          {settings.siteName || 'AZHARUDDIN'}
        </Link>

        <div className={styles.right}>
          {(linkedin || instagram || email) && (
            <div className={styles.social}>
              {linkedin && (
                <a
                  href={linkedin}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon size={17} />
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={17} />
                </a>
              )}
              {email && (
                <a href={email} className={styles.socialLink} aria-label="Email">
                  <MailIcon size={17} />
                </a>
              )}
            </div>
          )}
          <p className={styles.copyright}>
            © {year} {settings.footerCopyright || 'All Rights Reserved.'}
          </p>
        </div>
      </div>

      {settings.footerText && (
        <div className={`container ${styles.tagline}`}>
          <p>{settings.footerText}</p>
        </div>
      )}
    </footer>
  );
}
