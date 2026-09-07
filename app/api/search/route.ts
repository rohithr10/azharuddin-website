import { NextResponse } from 'next/server';
import { searchArticles } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = (searchParams.get('q') ?? '').slice(0, 120);

  if (term.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const articles = await searchArticles(term);
    // Only ship what the results list renders.
    const results = articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      image: article.image,
      publishedAt: article.publishedAt,
      category: article.category ? { name: article.category.name } : null,
    }));
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ results: [], error: 'Search is unavailable.' }, { status: 500 });
  }
}
