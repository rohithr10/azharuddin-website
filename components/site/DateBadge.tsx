import styles from './DateBadge.module.css';
import { dateParts } from '@/lib/utils';

type Props = {
  date?: string | Date | null;
  placement?: 'top-left' | 'top-right';
};

/** The stacked 03 / SEPT / 2026 marker that overlays editorial imagery. */
export default function DateBadge({ date, placement = 'top-right' }: Props) {
  const parts = dateParts(date);
  if (!parts) return null;

  return (
    <time className={styles.badge} data-placement={placement} dateTime={parts.iso}>
      <span className={styles.day}>{parts.day}</span>
      <span className={styles.month}>{parts.month}</span>
      <span className={styles.year}>{parts.year}</span>
    </time>
  );
}
