import Image from 'next/image';
import styles from './PageIntro.module.css';
import { Sprig } from '@/components/ui/icons';

type Props = {
  eyebrow?: string;
  title: string;
  intro?: string;
  image?: string;
};

/** Shared masthead for every interior page. */
export default function PageIntro({ eyebrow, title, intro, image }: Props) {
  return (
    <section className={styles.masthead} data-plain={image ? 'false' : 'true'}>
      {image ? (
        <>
          <div className={styles.media}>
            <Image src={image} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
          </div>
          <div className={styles.scrim} aria-hidden />
        </>
      ) : (
        <Sprig size={150} className={styles.sprig} aria-hidden />
      )}

      <div className="container">
        <div className={styles.inner}>
          {eyebrow && <p className="eyebrow eyebrow--rule eyebrow--on-dark">{eyebrow}</p>}
          <h1 className={styles.title}>{title}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
        </div>
      </div>
    </section>
  );
}
