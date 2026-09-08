'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { dbConnect } from '@/lib/db';
import { Article, Category, Media, Message, Page, Settings, User } from '@/lib/models';
import {
  clearAttempts,
  createSessionCookie,
  destroySessionCookie,
  isThrottled,
  registerFailedAttempt,
  requireSession,
} from '@/lib/auth';
import { sanitizeArticleHtml, sanitizeText } from '@/lib/sanitize';
import { deleteUpload } from '@/lib/upload';
import { excerptFromHtml, fromDateInputValue, readingTime, slugify } from '@/lib/utils';
import type { ActionState } from '@/lib/types';

/* ================================================================
 * Authentication
 * ================================================================ */

export async function loginAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const username = String(formData.get('username') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/admin');

  if (!username || !password) {
    return { error: 'Please enter both a username and a password.' };
  }

  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const throttleKey = `${ip}:${username}`;

  if (isThrottled(throttleKey)) {
    return { error: 'Too many failed attempts. Please wait a few minutes and try again.' };
  }

  try {
    await dbConnect();
    const user = await User.findOne({ username });
    const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid';
    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid) {
      registerFailedAttempt(throttleKey);
      return { error: 'That username and password do not match.' };
    }

    clearAttempts(throttleKey);
    user.lastLoginAt = new Date();
    await user.save();

    await createSessionCookie({ userId: String(user._id), username: user.username });
  } catch (error) {
    console.error('Login failed:', error);
    return { error: 'Could not sign in. Please check that the database is running.' };
  }

  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function logoutAction(): Promise<void> {
  await destroySessionCookie();
  redirect('/admin/login');
}

export async function changePasswordAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await requireSession();
    const current = String(formData.get('currentPassword') ?? '');
    const next = String(formData.get('newPassword') ?? '');
    const confirm = String(formData.get('confirmPassword') ?? '');

    if (next.length < 8) {
      return { error: 'Choose a new password of at least 8 characters.' };
    }
    if (next !== confirm) {
      return { error: 'The new passwords do not match.' };
    }

    await dbConnect();
    const user = await User.findById(session.userId);
    if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
      return { error: 'Your current password is not correct.' };
    }

    user.passwordHash = await bcrypt.hash(next, 12);
    await user.save();

    return { ok: true, message: 'Your password has been changed.' };
  } catch (error) {
    console.error('Password change failed:', error);
    return { error: 'Could not change the password.' };
  }
}

/* ================================================================
 * Articles
 * ================================================================ */

async function uniqueSlug(title: string, ignoreId?: string): Promise<string> {
  const base = slugify(title) || 'article';
  let candidate = base;
  let suffix = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await Article.findOne({
      slug: candidate,
      ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
    }).select('_id');
    if (!clash) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function saveArticleAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  let destination = '/admin/articles';

  try {
    await requireSession();
    await dbConnect();

    const id = String(formData.get('id') ?? '').trim();
    const intent = String(formData.get('intent') ?? 'draft');
    const title = sanitizeText(formData.get('title'), 200);
    const categoryId = String(formData.get('category') ?? '').trim();
    const excerpt = sanitizeText(formData.get('excerpt'), 400);
    const content = sanitizeArticleHtml(String(formData.get('content') ?? ''));
    const image = sanitizeText(formData.get('image'), 400);
    const imageAlt = sanitizeText(formData.get('imageAlt'), 200);
    const seoTitle = sanitizeText(formData.get('seoTitle'), 120);
    const seoDescription = sanitizeText(formData.get('seoDescription'), 300);
    const publishedInput = String(formData.get('publishedAt') ?? '').trim();

    if (!title) return { error: 'Please give the article a title.' };
    if (!categoryId) return { error: 'Please choose a category for this article.' };

    const plain = content.replace(/<[^>]*>/g, '').trim();
    if (!plain) return { error: 'Please write some article content before saving.' };

    const category = await Category.findById(categoryId).select('_id');
    if (!category) return { error: 'That category no longer exists. Please choose another.' };

    const status = intent === 'publish' ? 'published' : 'draft';

    if (id) {
      const article = await Article.findById(id);
      if (!article) return { error: 'That article could not be found.' };

      // Replacing the image? Remove the old file so uploads do not pile up.
      if (article.image && article.image !== image) {
        await deleteUpload(article.image);
      }

      const titleChanged = article.title !== title;

      article.title = title;
      if (titleChanged) article.slug = await uniqueSlug(title, id);
      article.category = category._id;
      article.excerpt = excerpt || excerptFromHtml(content);
      article.content = content;
      article.image = image;
      article.imageAlt = imageAlt;
      article.seoTitle = seoTitle;
      article.seoDescription = seoDescription;
      article.readingMinutes = readingTime(content);
      article.status = status;

      // The owner sets the date shown on the article and its cards.
      const chosenDate = publishedInput
        ? fromDateInputValue(publishedInput, article.publishedAt)
        : null;
      if (chosenDate) {
        article.publishedAt = chosenDate;
      } else if (status === 'published' && !article.publishedAt) {
        article.publishedAt = new Date();
      }

      await article.save();
      destination = `/admin/articles?saved=${article._id}`;
    } else {
      const created = await Article.create({
        title,
        slug: await uniqueSlug(title),
        category: category._id,
        excerpt: excerpt || excerptFromHtml(content),
        content,
        image,
        imageAlt,
        seoTitle,
        seoDescription,
        readingMinutes: readingTime(content),
        status,
        publishedAt:
          fromDateInputValue(publishedInput) ?? (status === 'published' ? new Date() : null),
      });
      destination = `/admin/articles?saved=${created._id}`;
    }

    revalidatePath('/');
    revalidatePath('/journal');
    revalidatePath('/admin/articles');
  } catch (error) {
    console.error('Saving the article failed:', error);
    return { error: 'The article could not be saved. Please try again.' };
  }

  redirect(destination);
}

export async function toggleArticleStatusAction(formData: FormData): Promise<void> {
  await requireSession();
  await dbConnect();

  const id = String(formData.get('id') ?? '');
  const article = await Article.findById(id);
  if (!article) return;

  if (article.status === 'published') {
    article.status = 'draft';
  } else {
    article.status = 'published';
    if (!article.publishedAt) article.publishedAt = new Date();
  }
  await article.save();

  revalidatePath('/');
  revalidatePath('/journal');
  revalidatePath('/admin/articles');
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  await requireSession();
  await dbConnect();

  const id = String(formData.get('id') ?? '');
  const article = await Article.findById(id);
  if (!article) return;

  await deleteUpload(article.image);

  // Never leave the homepage pointing at a story that no longer exists.
  await Settings.updateOne({ featuredArticle: article._id }, { $set: { featuredArticle: null } });
  await Article.deleteOne({ _id: article._id });

  revalidatePath('/');
  revalidatePath('/journal');
  revalidatePath('/admin/articles');
}

/* ================================================================
 * Categories
 * ================================================================ */

export async function saveCategoryAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireSession();
    await dbConnect();

    const id = String(formData.get('id') ?? '').trim();
    const name = sanitizeText(formData.get('name'), 80);
    const description = sanitizeText(formData.get('description'), 300);

    if (!name) return { error: 'Please enter a category name.' };

    const slug = slugify(name);
    if (!slug) return { error: 'Please use a name that contains letters or numbers.' };

    const clash = await Category.findOne({
      slug,
      ...(id ? { _id: { $ne: id } } : {}),
    }).select('_id');
    if (clash) return { error: `A category called “${name}” already exists.` };

    if (id) {
      await Category.updateOne({ _id: id }, { $set: { name, slug, description } });
    } else {
      await Category.create({ name, slug, description });
    }

    revalidatePath('/journal');
    revalidatePath('/admin/categories');
    return { ok: true, message: id ? 'Category updated.' : `Category “${name}” added.` };
  } catch (error) {
    console.error('Saving the category failed:', error);
    return { error: 'The category could not be saved.' };
  }
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireSession();
  await dbConnect();

  const id = String(formData.get('id') ?? '');
  const inUse = await Article.countDocuments({ category: id });
  if (inUse > 0) return; // Guarded in the UI; ignored here as a safety net.

  await Category.deleteOne({ _id: id });
  revalidatePath('/journal');
  revalidatePath('/admin/categories');
}

/* ================================================================
 * Featured story
 * ================================================================ */

export async function setFeaturedStoryAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireSession();
    await dbConnect();

    const articleId = String(formData.get('articleId') ?? '').trim();

    if (articleId) {
      const article = await Article.findOne({ _id: articleId, status: 'published' }).select('_id');
      if (!article) {
        return { error: 'Only a published article can be used as the featured story.' };
      }
    }

    await Settings.updateOne(
      { singleton: 'site' },
      { $set: { featuredArticle: articleId || null } },
      { upsert: true }
    );

    revalidatePath('/');
    revalidatePath('/admin/featured-story');
    return {
      ok: true,
      message: articleId
        ? 'The homepage featured story has been updated.'
        : 'The featured story has been cleared — the newest article will be shown instead.',
    };
  } catch (error) {
    console.error('Setting the featured story failed:', error);
    return { error: 'The featured story could not be updated.' };
  }
}

/* ================================================================
 * Status — the homepage banner image and the wording over it
 * ================================================================ */

export async function saveStatusAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireSession();
    await dbConnect();

    const settings =
      (await Settings.findOne({ singleton: 'site' })) ?? new Settings({ singleton: 'site' });

    const text = (key: string, max: number) => sanitizeText(formData.get(key), max);

    settings.heroEyebrow = text('heroEyebrow', 120);
    settings.heroHeading = text('heroHeading', 80) || 'AZHARUDDIN';
    settings.heroText = text('heroText', 400);
    settings.heroCtaLabel = text('heroCtaLabel', 60);
    settings.heroCtaHref = text('heroCtaHref', 120) || '/my-views';
    settings.heroRailText = text('heroRailText', 80);

    const incomingImage = text('heroImage', 400);
    if (settings.heroImage && settings.heroImage !== incomingImage) {
      await deleteUpload(settings.heroImage);
    }
    settings.heroImage = incomingImage;

    settings.updatedAt = new Date();
    await settings.save();

    revalidatePath('/', 'layout');
    revalidatePath('/admin/status');
    revalidatePath('/admin/settings');
    return { ok: true, message: 'The banner and status have been saved.' };
  } catch (error) {
    console.error('Saving the status failed:', error);
    return { error: 'The status could not be saved.' };
  }
}

/* ================================================================
 * Settings
 * ================================================================ */

const IMAGE_FIELDS = ['heroImage', 'aboutImage', 'footerImage'] as const;

export async function saveSettingsAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireSession();
    await dbConnect();

    const settings = (await Settings.findOne({ singleton: 'site' })) ?? new Settings({ singleton: 'site' });

    const text = (key: string, max = 400) => sanitizeText(formData.get(key), max);

    settings.siteName = text('siteName', 80) || 'AZHARUDDIN';
    settings.siteTagline = text('siteTagline', 160);
    settings.siteDescription = text('siteDescription', 320);

    settings.heroEyebrow = text('heroEyebrow', 120);
    settings.heroHeading = text('heroHeading', 80) || 'AZHARUDDIN';
    settings.heroText = text('heroText', 400);
    settings.heroCtaLabel = text('heroCtaLabel', 60);
    settings.heroCtaHref = text('heroCtaHref', 120) || '/my-views';
    settings.heroRailText = text('heroRailText', 80);

    settings.philosophyQuote = text('philosophyQuote', 320);

    settings.aboutEyebrow = text('aboutEyebrow', 80);
    settings.aboutHeading = text('aboutHeading', 160);
    settings.aboutText = text('aboutText', 600);
    settings.aboutCtaLabel = text('aboutCtaLabel', 60);

    settings.footerText = text('footerText', 200);
    settings.footerCopyright = text('footerCopyright', 120);

    settings.linkedinUrl = text('linkedinUrl', 300);
    settings.instagramUrl = text('instagramUrl', 300);
    settings.emailAddress = text('emailAddress', 180);

    for (const field of IMAGE_FIELDS) {
      const incoming = text(field, 400);
      const current = (settings as any)[field] as string;
      if (current && current !== incoming) {
        await deleteUpload(current);
      }
      (settings as any)[field] = incoming;
    }

    settings.updatedAt = new Date();
    await settings.save();

    revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');
    return { ok: true, message: 'Your settings have been saved.' };
  } catch (error) {
    console.error('Saving settings failed:', error);
    return { error: 'The settings could not be saved.' };
  }
}

/* ================================================================
 * Pages (About Me, My Views, Media, Contact, Journal intro)
 * ================================================================ */

export async function savePageAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireSession();
    await dbConnect();

    const key = String(formData.get('key') ?? '').trim();
    if (!key) return { error: 'Missing page reference.' };

    const page = (await Page.findOne({ key })) ?? new Page({ key, title: key });

    const previousImage = page.image as string;
    const incomingImage = sanitizeText(formData.get('image'), 400);
    if (previousImage && previousImage !== incomingImage) {
      await deleteUpload(previousImage);
    }

    page.title = sanitizeText(formData.get('title'), 160) || page.title;
    page.eyebrow = sanitizeText(formData.get('eyebrow'), 80);
    page.intro = sanitizeText(formData.get('intro'), 600);
    page.body = sanitizeArticleHtml(String(formData.get('body') ?? ''));
    page.image = incomingImage;
    page.seoTitle = sanitizeText(formData.get('seoTitle'), 120);
    page.seoDescription = sanitizeText(formData.get('seoDescription'), 300);

    // Sections arrive as sections[i][field]; rebuild the list from scratch.
    const sections: Array<Record<string, string>> = [];
    const indexes = new Set<number>();
    for (const rawKey of formData.keys()) {
      const match = rawKey.match(/^sections\[(\d+)]\[/);
      if (match) indexes.add(Number(match[1]));
    }

    const removedImages: string[] = [];
    const keptImages = new Set<string>();

    for (const index of [...indexes].sort((a, b) => a - b)) {
      const heading = sanitizeText(formData.get(`sections[${index}][heading]`), 160);
      const body = sanitizeArticleHtml(String(formData.get(`sections[${index}][body]`) ?? ''));
      const image = sanitizeText(formData.get(`sections[${index}][image]`), 400);
      const link = sanitizeText(formData.get(`sections[${index}][link]`), 300);
      const meta = sanitizeText(formData.get(`sections[${index}][meta]`), 120);

      if (!heading && !body && !image && !link && !meta) continue;
      if (image) keptImages.add(image);
      sections.push({ heading, body, image, link, meta });
    }

    for (const section of page.sections ?? []) {
      const image = (section as any).image as string;
      if (image && !keptImages.has(image)) removedImages.push(image);
    }
    await Promise.all(removedImages.map((url) => deleteUpload(url)));

    page.sections = sections as any;
    await page.save();

    revalidatePath('/');
    revalidatePath(`/${key === 'journal' ? 'journal' : key}`);
    revalidatePath('/admin/pages');
    return { ok: true, message: 'Page content saved.' };
  } catch (error) {
    console.error('Saving the page failed:', error);
    return { error: 'The page could not be saved.' };
  }
}

/* ================================================================
 * Media library
 * ================================================================ */

export async function deleteMediaAction(formData: FormData): Promise<void> {
  await requireSession();
  await dbConnect();

  const url = String(formData.get('url') ?? '');
  if (!url) return;

  // Refuse to orphan an image that a page or article is still using.
  const [articleUse, settingsUse, pageUse] = await Promise.all([
    Article.countDocuments({ image: url }),
    Settings.countDocuments({
      $or: [{ heroImage: url }, { aboutImage: url }, { footerImage: url }],
    }),
    Page.countDocuments({ $or: [{ image: url }, { 'sections.image': url }] }),
  ]);

  if (articleUse + settingsUse + pageUse > 0) return;

  await deleteUpload(url);
  revalidatePath('/admin/media');
}

export async function updateMediaAltAction(formData: FormData): Promise<void> {
  await requireSession();
  await dbConnect();

  const id = String(formData.get('id') ?? '');
  const alt = sanitizeText(formData.get('alt'), 200);
  await Media.updateOne({ _id: id }, { $set: { alt } });

  revalidatePath('/admin/media');
}

/* ================================================================
 * Messages
 * ================================================================ */

export async function markMessageReadAction(formData: FormData): Promise<void> {
  await requireSession();
  await dbConnect();
  const id = String(formData.get('id') ?? '');
  const read = String(formData.get('read') ?? 'true') === 'true';
  await Message.updateOne({ _id: id }, { $set: { read } });
  revalidatePath('/admin/messages');
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await requireSession();
  await dbConnect();
  await Message.deleteOne({ _id: String(formData.get('id') ?? '') });
  revalidatePath('/admin/messages');
}
