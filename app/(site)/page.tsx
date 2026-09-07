import type { Metadata } from 'next';
import Hero from '@/components/site/Hero';
import FeaturedStory from '@/components/site/FeaturedStory';
import JournalRail from '@/components/site/JournalRail';
import PhilosophyBand from '@/components/site/PhilosophyBand';
import AboutSection from '@/components/site/AboutSection';
import { getFeaturedArticle, getPublishedArticles, getSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `${settings.siteName || 'Azharuddin'} — ${settings.siteTagline || 'Humanitarian. Nature Lover.'}`,
    description: settings.siteDescription,
    alternates: { canonical: '/' },
    openGraph: {
      title: settings.siteName,
      description: settings.siteDescription,
      images: settings.heroImage ? [settings.heroImage] : undefined,
    },
  };
}

export default async function HomePage() {
  const [settings, featured, articles] = await Promise.all([
    getSettings(),
    getFeaturedArticle(),
    getPublishedArticles(9),
  ]);

  // Don't repeat the featured story immediately below itself.
  const railArticles = featured ? articles.filter((a) => a.id !== featured.id) : articles;

  return (
    <>
      <Hero settings={settings} />
      {featured && <FeaturedStory article={featured} />}
      <JournalRail articles={railArticles} />
      <PhilosophyBand quote={settings.philosophyQuote} />
      <AboutSection settings={settings} />
    </>
  );
}
