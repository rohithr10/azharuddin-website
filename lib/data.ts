import 'server-only';
import { dbConnect } from '@/lib/db';
import { Article, Category, Media, Page, Settings } from '@/lib/models';
import type {
  ArticleView,
  CategoryView,
  MediaView,
  PageView,
  SettingsView,
} from '@/lib/types';

/* ---------------------------------------------------------------- *
 * Serialisers — mongoose documents are not safe to pass into client
 * components, so every read goes through one of these.
 * ---------------------------------------------------------------- */

function toIso(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function serializeCategory(doc: any): CategoryView | null {
  if (!doc) return null;
  return {
    id: String(doc._id),
    name: doc.name ?? '',
    slug: doc.slug ?? '',
    description: doc.description ?? '',
  };
}

export function serializeArticle(doc: any): ArticleView {
  return {
    id: String(doc._id),
    title: doc.title ?? '',
    slug: doc.slug ?? '',
    excerpt: doc.excerpt ?? '',
    content: doc.content ?? '',
    image: doc.image ?? '',
    imageAlt: doc.imageAlt ?? '',
    status: doc.status === 'published' ? 'published' : 'draft',
    publishedAt: toIso(doc.publishedAt),
    createdAt: toIso(doc.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(doc.updatedAt) ?? new Date().toISOString(),
    seoTitle: doc.seoTitle ?? '',
    seoDescription: doc.seoDescription ?? '',
    readingMinutes: doc.readingMinutes ?? 1,
    category:
      doc.category && typeof doc.category === 'object' && 'name' in doc.category
        ? serializeCategory(doc.category)
        : null,
  };
}

export function serializeSettings(doc: any): SettingsView {
  return {
    siteName: doc?.siteName ?? 'AZHARUDDIN',
    siteTagline: doc?.siteTagline ?? '',
    siteDescription: doc?.siteDescription ?? '',
    heroImage: doc?.heroImage ?? '',
    heroEyebrow: doc?.heroEyebrow ?? '',
    heroHeading: doc?.heroHeading ?? 'AZHARUDDIN',
    heroText: doc?.heroText ?? '',
    heroCtaLabel: doc?.heroCtaLabel ?? 'EXPLORE MY VIEWS',
    heroCtaHref: doc?.heroCtaHref ?? '/my-views',
    heroRailText: doc?.heroRailText ?? 'PURPOSE • PEOPLE • PLANET',
    featuredArticleId: doc?.featuredArticle ? String(doc.featuredArticle) : null,
    philosophyQuote: doc?.philosophyQuote ?? '',
    aboutEyebrow: doc?.aboutEyebrow ?? 'ABOUT AZHARUDDIN',
    aboutHeading: doc?.aboutHeading ?? '',
    aboutText: doc?.aboutText ?? '',
    aboutCtaLabel: doc?.aboutCtaLabel ?? 'READ MORE ABOUT ME',
    aboutImage: doc?.aboutImage ?? '',
    footerImage: doc?.footerImage ?? '',
    footerText: doc?.footerText ?? '',
    footerCopyright: doc?.footerCopyright ?? 'All Rights Reserved.',
    linkedinUrl: doc?.linkedinUrl ?? '',
    instagramUrl: doc?.instagramUrl ?? '',
    emailAddress: doc?.emailAddress ?? '',
  };
}

export function serializePage(doc: any, key: string): PageView {
  return {
    key: doc?.key ?? key,
    title: doc?.title ?? '',
    eyebrow: doc?.eyebrow ?? '',
    intro: doc?.intro ?? '',
    body: doc?.body ?? '',
    image: doc?.image ?? '',
    sections: (doc?.sections ?? []).map((section: any) => ({
      id: String(section._id ?? ''),
      heading: section.heading ?? '',
      body: section.body ?? '',
      image: section.image ?? '',
      link: section.link ?? '',
      meta: section.meta ?? '',
    })),
    seoTitle: doc?.seoTitle ?? '',
    seoDescription: doc?.seoDescription ?? '',
  };
}

export function serializeMedia(doc: any): MediaView {
  return {
    id: String(doc._id),
    url: doc.url,
    filename: doc.filename ?? '',
    originalName: doc.originalName ?? '',
    alt: doc.alt ?? '',
    purpose: doc.purpose ?? 'general',
    width: doc.width ?? 0,
    height: doc.height ?? 0,
    size: doc.size ?? 0,
    createdAt: toIso(doc.createdAt) ?? new Date().toISOString(),
  };
}

/* ---------------------------------------------------------------- *
 * Reads
 * ---------------------------------------------------------------- */

export async function getSettings(): Promise<SettingsView> {
  await dbConnect();
  const doc = await Settings.findOne({ singleton: 'site' }).lean();
  if (!doc) {
    const created = await Settings.create({ singleton: 'site' });
    return serializeSettings(created.toObject());
  }
  return serializeSettings(doc);
}

export async function getPublishedArticles(limit?: number): Promise<ArticleView[]> {
  await dbConnect();
  const query = Article.find({ status: 'published' })
    .populate('category')
    .sort({ publishedAt: -1, createdAt: -1 });
  if (limit) query.limit(limit);
  const docs = await query.lean();
  return docs.map(serializeArticle);
}

export async function getArticleBySlug(slug: string): Promise<ArticleView | null> {
  await dbConnect();
  const doc = await Article.findOne({ slug, status: 'published' }).populate('category').lean();
  return doc ? serializeArticle(doc) : null;
}

export async function getAdjacentArticles(publishedAt: string | null, id: string) {
  await dbConnect();
  if (!publishedAt) return { previous: null, next: null };
  const date = new Date(publishedAt);

  const [previous, next] = await Promise.all([
    Article.findOne({ status: 'published', publishedAt: { $lt: date }, _id: { $ne: id } })
      .populate('category')
      .sort({ publishedAt: -1 })
      .lean(),
    Article.findOne({ status: 'published', publishedAt: { $gt: date }, _id: { $ne: id } })
      .populate('category')
      .sort({ publishedAt: 1 })
      .lean(),
  ]);

  return {
    previous: previous ? serializeArticle(previous) : null,
    next: next ? serializeArticle(next) : null,
  };
}

export async function getFeaturedArticle(): Promise<ArticleView | null> {
  await dbConnect();
  const settings = await Settings.findOne({ singleton: 'site' }).lean();
  const featuredId = (settings as any)?.featuredArticle;

  if (featuredId) {
    const doc = await Article.findOne({ _id: featuredId, status: 'published' })
      .populate('category')
      .lean();
    if (doc) return serializeArticle(doc);
  }

  // Fall back to the most recent published article so the homepage is never empty.
  const latest = await Article.findOne({ status: 'published' })
    .populate('category')
    .sort({ publishedAt: -1 })
    .lean();
  return latest ? serializeArticle(latest) : null;
}

export async function getCategories(): Promise<CategoryView[]> {
  await dbConnect();
  const docs = await Category.find().sort({ name: 1 }).lean();
  const counts = await Article.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((entry) => [String(entry._id), entry.count as number]));

  return docs.map((doc) => ({
    ...serializeCategory(doc)!,
    articleCount: countMap.get(String(doc._id)) ?? 0,
  }));
}

export async function getPage(key: string): Promise<PageView | null> {
  await dbConnect();
  const doc = await Page.findOne({ key }).lean();
  return doc ? serializePage(doc, key) : null;
}

export async function getMediaLibrary(limit = 200): Promise<MediaView[]> {
  await dbConnect();
  const docs = await Media.find().sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map(serializeMedia);
}

export async function searchArticles(term: string, limit = 12): Promise<ArticleView[]> {
  const query = term.trim();
  if (query.length < 2) return [];

  await dbConnect();
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escaped, 'i');

  const matchingCategories = await Category.find({ name: pattern }).select('_id').lean();

  const docs = await Article.find({
    status: 'published',
    $or: [
      { title: pattern },
      { excerpt: pattern },
      { content: pattern },
      ...(matchingCategories.length
        ? [{ category: { $in: matchingCategories.map((c) => c._id) } }]
        : []),
    ],
  })
    .populate('category')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();

  return docs.map(serializeArticle);
}

/**
 * Where each uploaded image is currently used, so the Media Library can
 * explain why something cannot be deleted instead of silently refusing.
 */
export async function getMediaUsage(): Promise<Record<string, string[]>> {
  await dbConnect();

  const usage: Record<string, string[]> = {};
  const add = (url: unknown, label: string) => {
    if (typeof url !== 'string' || !url) return;
    usage[url] = usage[url] ?? [];
    if (!usage[url].includes(label)) usage[url].push(label);
  };

  const [settings, articles, pages] = await Promise.all([
    Settings.findOne({ singleton: 'site' }).lean(),
    Article.find({ image: { $ne: '' } }).select('title image').lean(),
    Page.find().select('key title image sections').lean(),
  ]);

  const s = settings as any;
  add(s?.heroImage, 'Homepage banner');
  add(s?.aboutImage, 'About section');
  add(s?.footerImage, 'Footer background');

  for (const article of articles as any[]) {
    add(article.image, `Article: ${article.title}`);
  }

  for (const page of pages as any[]) {
    add(page.image, `Page header: ${page.title || page.key}`);
    for (const section of page.sections ?? []) {
      add(section.image, `Page section: ${page.title || page.key}`);
    }
  }

  return usage;
}

export async function getDashboardStats() {
  await dbConnect();
  const [total, published, drafts, categories, media] = await Promise.all([
    Article.countDocuments(),
    Article.countDocuments({ status: 'published' }),
    Article.countDocuments({ status: 'draft' }),
    Category.countDocuments(),
    Media.countDocuments(),
  ]);
  return { total, published, drafts, categories, media };
}
