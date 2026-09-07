/**
 * Shown until the client uploads their own photography through the CMS.
 * Every one of these is replaceable from the admin panel.
 */
export const PLACEHOLDER = {
  hero: '/placeholders/hero.jpg',
  featured: '/placeholders/featured.jpg',
  article: '/placeholders/article.jpg',
  about: '/placeholders/about.jpg',
  footer: '/placeholders/footer.jpg',
} as const;

export function withFallback(url: string | null | undefined, fallback: string): string {
  return url && url.trim() ? url : fallback;
}
