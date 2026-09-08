export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

/** 03 · SEPT · 2026 date parts used by the overlay badges. */
export function dateParts(value?: string | Date | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleString('en-GB', { month: 'short' }).toUpperCase(),
    year: String(date.getFullYear()),
    iso: date.toISOString(),
  };
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function readingTime(html: string): number {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function excerptFromHtml(html: string, length = 180): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length).replace(/\s+\S*$/, '')}…`;
}

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

/**
 * Only allow links we are willing to render as href values. Blocks
 * javascript: and other script-bearing schemes coming from CMS input.
 */
export function safeUrl(value?: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(https?:\/\/|mailto:|\/)/i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(trimmed)) return `https://${trimmed}`;
  return '';
}

export function mailtoUrl(email?: string | null): string {
  if (!email) return '';
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return '';
  return `mailto:${trimmed}`;
}

/** YYYY-MM-DD for <input type="date">, in local time. */
export function toDateInputValue(value?: string | Date | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Reads a YYYY-MM-DD value from a date input. Keeps the time-of-day from the
 * existing date where there is one, so re-saving does not reshuffle articles
 * that were published on the same day.
 */
export function fromDateInputValue(
  value: string,
  previous?: string | Date | null
): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const base = previous ? new Date(previous) : null;
  const valid = base && !Number.isNaN(base.getTime());

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    valid ? base!.getHours() : 9,
    valid ? base!.getMinutes() : 0,
    valid ? base!.getSeconds() : 0
  );
}
