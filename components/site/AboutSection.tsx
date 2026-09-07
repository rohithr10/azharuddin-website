import Image from 'next/image';
import Link from 'next/link';
import styles from './AboutSection.module.css';
import Reveal from '@/components/ui/Reveal';
import { ArrowRight, Sprig } from '@/components/ui/icons';
import { PLACEHOLDER, withFallback } from '@/lib/placeholders';
import type { SettingsView } from '@/lib/types';

export default function AboutSection({ settings }: { settings: SettingsView }) {
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
            {settings.aboutHeading || 'A life of purpose.\nA legacy of impact.'}
          </h2>
          <hr className="rule-gold" />
          {settings.aboutText && <p className={styles.text}>{settings.aboutText}</p>}
          <Link href="/about-me" className={`btn btn--solid-forest ${styles.cta}`}>
            {settings.aboutCtaLabel || 'READ MORE ABOUT ME'}
            <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
