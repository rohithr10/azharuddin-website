import Image from 'next/image';
import Link from 'next/link';
import styles from './AboutSection.module.css';
import Reveal from '@/components/ui/Reveal';
import { ArrowRight, Sprig } from '@/components/ui/icons';
import { PLACEHOLDER, withFallback } from '@/lib/placeholders';
import type { PageView, SettingsView } from '@/lib/types';

type Props = {
  settings: SettingsView;
  /** Used as the short brief when the Settings fields are left empty. */
  aboutPage?: PageView | null;
};

export default function AboutSection({ settings, aboutPage }: Props) {
  // Editable in Settings → About. Left blank, it falls back to the About Me
  // page, so the homepage shows a short brief of that page instead.
  const heading =
    settings.aboutHeading?.trim() ||
    aboutPage?.title?.trim() ||
    'A life of purpose.\nA legacy of impact.';

  const text = settings.aboutText?.trim() || aboutPage?.intro?.trim() || '';

  return (
    <section className={styles.section} aria-labelledby="about-heading">
      <Sprig size={140} className={styles.sprig} aria-hidden />
      <div className={styles.grid}>
        <div className={styles.media}>
          <Image
            src={withFallback(settings.aboutImage, PLACEHOLDER.about)}
            alt={`${settings.siteName || 'Azharuddin'} portrait`}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
          />
        </div>

        <Reveal className={styles.content}>
          <p className="eyebrow eyebrow--rule">{settings.aboutEyebrow || 'About Azharuddin'}</p>
          <h2 id="about-heading" className={styles.heading}>
            {heading}
          </h2>
          <hr className="rule-gold" />
          {text && <p className={styles.text}>{text}</p>}
          <Link href="/about-me" className={`btn btn--solid-forest ${styles.cta}`}>
            {settings.aboutCtaLabel || 'READ MORE ABOUT ME'}
            <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
