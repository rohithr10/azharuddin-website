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
