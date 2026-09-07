import Image from 'next/image';
import styles from './SectionBlocks.module.css';
import Reveal from '@/components/ui/Reveal';
import { ArrowRight } from '@/components/ui/icons';
import { safeUrl } from '@/lib/utils';
import type { PageSectionView } from '@/lib/types';

type Props = {
  sections: PageSectionView[];
  variant: 'alternating' | 'cards' | 'media';
};

export default function SectionBlocks({ sections, variant }: Props) {
  if (!sections?.length) return null;

  if (variant === 'cards') {
    return (
      <div className={styles.cards}>
        {sections.map((section, index) => (
          <Reveal key={section.id || index} delay={Math.min(index, 5) * 70}>
            <div className={styles.card}>
              <span className={styles.cardIndex}>
                {String(index + 1).padStart(2, '0')}
              </span>
              {section.heading && <h3 className={styles.cardHeading}>{section.heading}</h3>}
              {section.body && (
                <div className="prose" dangerouslySetInnerHTML={{ __html: section.body }} />
              )}
            </div>
          </Reveal>
        ))}
      </div>
    );
  }

  if (variant === 'media') {
    return (
      <div className={styles.mediaList}>
        {sections.map((section, index) => {
          const href = safeUrl(section.link);
          const content = (
            <>
              <div className={styles.mediaThumb}>
                {section.image ? (
                  <Image
                    src={section.image}
                    alt={section.heading || ''}
                    width={440}
                    height={275}
                    sizes="(max-width: 900px) 100vw, 220px"
                  />
                ) : null}
              </div>
              <div>
                {section.meta && <span className={styles.mediaMeta}>{section.meta}</span>}
                {section.heading && <h3 className={styles.mediaHeading}>{section.heading}</h3>}
                {section.body && (
                  <div
                    className={styles.mediaBody}
                    dangerouslySetInnerHTML={{ __html: section.body }}
                  />
                )}
              </div>
              {href && (
                <span className="link-arrow link-arrow--muted">
                  View
                  <ArrowRight size={15} />
                </span>
              )}
            </>
          );

          return (
            <Reveal key={section.id || index} delay={Math.min(index, 5) * 60}>
              {href ? (
                <a
                  className={styles.mediaItem}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              ) : (
                <div className={styles.mediaItem}>{content}</div>
              )}
            </Reveal>
          );
        })}
      </div>
    );
  }

  return (
    <div className={styles.alternating}>
      {sections.map((section, index) => (
        <Reveal key={section.id || index}>
          <div className={styles.altItem}>
            {section.image && (
              <div className={styles.altMedia}>
                <Image
                  src={section.image}
                  alt={section.heading || ''}
                  width={900}
                  height={675}
                  sizes="(max-width: 900px) 100vw, 45vw"
                />
              </div>
            )}
            <div>
              {section.meta && <p className="eyebrow eyebrow--rule">{section.meta}</p>}
              {section.heading && <h2 className={styles.altHeading}>{section.heading}</h2>}
              {section.body && (
                <div
                  className={`prose ${styles.altBody}`}
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              )}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
