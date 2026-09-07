import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';
import { ArrowRight, InstagramIcon, LinkedInIcon, MailIcon, Sprig } from '@/components/ui/icons';
import { PLACEHOLDER, withFallback } from '@/lib/placeholders';
import { mailtoUrl, safeUrl } from '@/lib/utils';
import type { SettingsView } from '@/lib/types';

export default function Hero({ settings }: { settings: SettingsView }) {
  const linkedin = safeUrl(settings.linkedinUrl);
  const instagram = safeUrl(settings.instagramUrl);
  const email = mailtoUrl(settings.emailAddress);
  const ctaHref = settings.heroCtaHref?.startsWith('/') ? settings.heroCtaHref : '/my-views';

  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className={styles.media}>
        <Image
          src={withFallback(settings.heroImage, PLACEHOLDER.hero)}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={88}
        />
      </div>
      <div className={styles.scrim} aria-hidden />

      {settings.heroRailText && (
        <div className={styles.rail} aria-hidden>
          <Sprig size={26} className={styles.railSprig} />
          <span className={styles.railLine} />
          <span className={styles.railText}>{settings.heroRailText}</span>
        </div>
      )}

      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          {settings.heroEyebrow && <p className={styles.eyebrow}>{settings.heroEyebrow}</p>}
          <h1 className={styles.heading}>{settings.heroHeading || 'AZHARUDDIN'}</h1>
          <div className={styles.rule} aria-hidden />
          {settings.heroText && <p className={styles.text}>{settings.heroText}</p>}
          <div className={styles.cta}>
            <Link href={ctaHref} className="btn btn--outline-light">
              {settings.heroCtaLabel || 'EXPLORE MY VIEWS'}
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>

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
              <LinkedInIcon size={16} />
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
              <InstagramIcon size={16} />
            </a>
          )}
          {email && (
            <a href={email} className={styles.socialLink} aria-label="Email">
              <MailIcon size={16} />
            </a>
          )}
        </div>
      )}
    </section>
  );
}
