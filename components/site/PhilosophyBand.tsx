import styles from './PhilosophyBand.module.css';
import Reveal from '@/components/ui/Reveal';
import { QuoteMark, Sprig } from '@/components/ui/icons';

export default function PhilosophyBand({ quote }: { quote: string }) {
  if (!quote?.trim()) return null;

  return (
    <section className={styles.band} aria-label="Philosophy">
      <Sprig size={120} className={styles.sprig} aria-hidden />
      <Sprig size={90} className={styles.sprigLeft} aria-hidden />
      <div className="container">
        <Reveal>
          <figure className={styles.inner}>
            <QuoteMark size={44} className={styles.mark} />
            <blockquote className={styles.quote}>{quote}</blockquote>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
