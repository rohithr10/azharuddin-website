import type { MetadataRoute } from 'next';
import { getPublishedArticles } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about-me`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/my-views`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/journal`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/media`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: 'yearly', priority: 0.5 },
  ];

  try {
    const articles = await getPublishedArticles();
    return [
      ...staticRoutes,
      ...articles.map((article) => ({
        url: `${base}/journal/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
