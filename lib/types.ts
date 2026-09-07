export type CategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount?: number;
};

export type ArticleView = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  imageAlt: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
  readingMinutes: number;
  category: CategoryView | null;
};

export type SettingsView = {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  heroImage: string;
  heroEyebrow: string;
  heroHeading: string;
  heroText: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  heroRailText: string;
  featuredArticleId: string | null;
  philosophyQuote: string;
  aboutEyebrow: string;
  aboutHeading: string;
  aboutText: string;
  aboutCtaLabel: string;
  aboutImage: string;
  footerImage: string;
  footerText: string;
  footerCopyright: string;
  linkedinUrl: string;
  instagramUrl: string;
  emailAddress: string;
};

export type PageSectionView = {
  id: string;
  heading: string;
  body: string;
  image: string;
  link: string;
  meta: string;
};

export type PageView = {
  key: string;
  title: string;
  eyebrow: string;
  intro: string;
  body: string;
  image: string;
  sections: PageSectionView[];
  seoTitle: string;
  seoDescription: string;
};

export type MediaView = {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  alt: string;
  purpose: string;
  width: number;
  height: number;
  size: number;
  createdAt: string;
};

export type ActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
};
