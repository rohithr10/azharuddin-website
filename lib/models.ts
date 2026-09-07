import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

/* ------------------------------------------------------------------ *
 * User — CMS administrators
 * ------------------------------------------------------------------ */
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: 'Administrator' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ *
 * Category — one category has many articles
 * ------------------------------------------------------------------ */
const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ *
 * Media — every uploaded file, reusable across the site
 * ------------------------------------------------------------------ */
const MediaSchema = new Schema(
  {
    url: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: 'image/jpeg' },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    size: { type: Number, default: 0 },
    alt: { type: String, default: '' },
    purpose: { type: String, default: 'general' },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ *
 * Article — the Journal
 * ------------------------------------------------------------------ */
const ArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: { type: Date, default: null },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    readingMinutes: { type: Number, default: 1 },
  },
  { timestamps: true }
);

ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

/* ------------------------------------------------------------------ *
 * Page — editable standalone pages (About Me, My Views, Media, Contact)
 * ------------------------------------------------------------------ */
const PageSectionSchema = new Schema(
  {
    heading: { type: String, default: '' },
    body: { type: String, default: '' },
    image: { type: String, default: '' },
    link: { type: String, default: '' },
    meta: { type: String, default: '' },
  },
  { _id: true }
);

const PageSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    eyebrow: { type: String, default: '' },
    intro: { type: String, default: '' },
    body: { type: String, default: '' },
    image: { type: String, default: '' },
    sections: { type: [PageSectionSchema], default: [] },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ *
 * Message — submissions from the public contact form
 * ------------------------------------------------------------------ */
const MessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ *
 * Settings — one document holding site-wide editable content
 * ------------------------------------------------------------------ */
const SettingsSchema = new Schema(
  {
    singleton: { type: String, default: 'site', unique: true },

    siteName: { type: String, default: 'AZHARUDDIN' },
    siteTagline: { type: String, default: 'Humanitarian. Nature lover.' },
    siteDescription: {
      type: String,
      default:
        'Personal reflections on life, leadership, humanity and our responsibility towards creating a better world.',
    },

    heroImage: { type: String, default: '' },
    heroEyebrow: { type: String, default: 'HUMANITARIAN. NATURE LOVER.' },
    heroHeading: { type: String, default: 'AZHARUDDIN' },
    heroText: {
      type: String,
      default:
        'Sharing thoughts on life, leadership, humanity and our responsibility towards creating a better world.',
    },
    heroCtaLabel: { type: String, default: 'EXPLORE MY VIEWS' },
    heroCtaHref: { type: String, default: '/my-views' },
    heroRailText: { type: String, default: 'PURPOSE • PEOPLE • PLANET' },

    featuredArticle: { type: Schema.Types.ObjectId, ref: 'Article', default: null },

    philosophyQuote: {
      type: String,
      default:
        'I believe in touching lives, protecting nature and leaving this world a little better.',
    },

    aboutEyebrow: { type: String, default: 'ABOUT AZHARUDDIN' },
    aboutHeading: { type: String, default: 'A life of purpose.\nA legacy of impact.' },
    aboutText: {
      type: String,
      default:
        'I am committed to building opportunities, empowering communities and creating a sustainable tomorrow. Humanitarian by heart. Driven by purpose.',
    },
    aboutCtaLabel: { type: String, default: 'READ MORE ABOUT ME' },
    aboutImage: { type: String, default: '' },

    footerImage: { type: String, default: '' },
    footerText: { type: String, default: 'Thoughts for a kinder, brighter tomorrow.' },
    footerCopyright: { type: String, default: 'All Rights Reserved.' },

    linkedinUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    emailAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;
export type CategoryDoc = InferSchemaType<typeof CategorySchema>;
export type ArticleDoc = InferSchemaType<typeof ArticleSchema>;
export type MediaDoc = InferSchemaType<typeof MediaSchema>;
export type PageDoc = InferSchemaType<typeof PageSchema>;
export type SettingsDoc = InferSchemaType<typeof SettingsSchema>;
export type MessageDoc = InferSchemaType<typeof MessageSchema>;

export const User = models.User || model('User', UserSchema);
export const Category = models.Category || model('Category', CategorySchema);
export const Article = models.Article || model('Article', ArticleSchema);
export const Media = models.Media || model('Media', MediaSchema);
export const Page = models.Page || model('Page', PageSchema);
export const Settings = models.Settings || model('Settings', SettingsSchema);
export const Message = models.Message || model('Message', MessageSchema);

export type { mongoose };
