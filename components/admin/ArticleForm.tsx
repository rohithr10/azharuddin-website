'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';
import ImageField from './ImageField';
import RichTextEditor from './RichTextEditor';
import SubmitButton from './SubmitButton';
import { saveArticleAction } from '@/app/admin/actions';
import { toDateInputValue } from '@/lib/utils';
import type { ActionState, ArticleView, CategoryView } from '@/lib/types';

type Props = {
  article: ArticleView | null;
  categories: CategoryView[];
};

export default function ArticleForm({ article, categories }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    saveArticleAction,
    undefined
  );
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // The publish/draft choice travels in a hidden field rather than on the
  // submit button, so it reaches the server action reliably.
  const intentRef = useRef<HTMLInputElement>(null);

  // Warn before a browser navigation would lose unsaved work.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!dirty || submitting) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty, submitting]);

  function goBack() {
    if (dirty && !window.confirm('You have unsaved changes. Leave this page and lose them?')) {
      return;
    }
    router.push('/admin/articles');
  }

  const markDirty = () => setDirty(true);

  return (
    <form action={formAction} onChange={markDirty} onSubmit={() => setSubmitting(true)}>
      {state?.error && (
        <p className="a-notice a-notice--error" role="alert">
          {state.error}
        </p>
      )}

      {article && (
        <p className="a-notice a-notice--info">
          Editing an existing article. Its web address is{' '}
          <strong>/journal/{article.slug}</strong>
          {article.status === 'published' && (
            <>
              {' — '}
              <Link href={`/journal/${article.slug}`} target="_blank">
                view it on the site ↗
              </Link>
            </>
          )}
        </p>
      )}

      <input type="hidden" name="id" value={article?.id ?? ''} />
      <input type="hidden" name="intent" defaultValue="draft" ref={intentRef} />

      <div className="a-grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="a-panel">
            <div className="a-field">
              <label className="a-label" htmlFor="title">
                Article title <span className="a-required">*</span>
              </label>
              <input
                id="title"
                name="title"
                className="a-input"
                defaultValue={article?.title ?? ''}
                required
                maxLength={200}
                placeholder="Enter article title"
              />
              <span className="a-hint">
                The web address is created from the title automatically.
              </span>
            </div>

            <div className="a-field">
              <label className="a-label" htmlFor="category">
                Category <span className="a-required">*</span>
              </label>
              <select
                id="category"
                name="category"
                className="a-select"
                defaultValue={article?.category?.id ?? ''}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <span className="a-hint">
                Need another one?{' '}
                <Link href="/admin/categories" target="_blank">
                  Add a new category ↗
                </Link>{' '}
                then reload this page.
              </span>
            </div>

            <div className="a-field">
              <label className="a-label" htmlFor="publishedAt">
                Article date
              </label>
              <input
                id="publishedAt"
                name="publishedAt"
                type="date"
                className="a-input"
                defaultValue={toDateInputValue(article?.publishedAt ?? article?.createdAt)}
              />
              <span className="a-hint">
                Shown on the date badge over the article image, on the article page and in the
                journal. Leave empty on a new article to use today’s date.
              </span>
            </div>

            <div className="a-field">
              <label className="a-label" htmlFor="excerpt">
                Short description
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                className="a-textarea"
                defaultValue={article?.excerpt ?? ''}
                maxLength={400}
                placeholder="One or two sentences shown on the article card and the homepage."
                style={{ minHeight: '90px' }}
              />
              <span className="a-hint">
                Leave this empty and the opening of the article will be used.
              </span>
            </div>
          </div>

          <div className="a-panel">
            <ImageField
              name="image"
              label="Featured image"
              purpose="article"
              defaultValue={article?.image ?? ''}
              altName="imageAlt"
              defaultAlt={article?.imageAlt ?? ''}
              onChange={markDirty}
            />
          </div>

          <div className="a-panel">
            <h2 className="a-panel-title">Search engine listing</h2>
            <p className="a-panel-note">Optional. Leave empty to use the title and description.</p>
            <div className="a-field">
              <label className="a-label" htmlFor="seoTitle">
                SEO title
              </label>
              <input
                id="seoTitle"
                name="seoTitle"
                className="a-input"
                defaultValue={article?.seoTitle ?? ''}
                maxLength={120}
              />
            </div>
            <div className="a-field" style={{ marginBottom: 0 }}>
              <label className="a-label" htmlFor="seoDescription">
                SEO description
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                className="a-textarea"
                defaultValue={article?.seoDescription ?? ''}
                maxLength={300}
                style={{ minHeight: '80px' }}
              />
            </div>
          </div>
        </div>

        <div className="a-panel">
          <label className="a-label" htmlFor="content">
            Article content <span className="a-required">*</span>
          </label>
          <p className="a-panel-note" style={{ marginTop: '0.4rem' }}>
            Write as long an article as you like. Use headings, lists and quotes to break it up.
          </p>
          <RichTextEditor
            name="content"
            defaultValue={article?.content ?? ''}
            onDirty={markDirty}
          />
        </div>
      </div>

      <div className="a-actions a-actions--sticky">
        <SubmitButton
          className="a-btn a-btn--primary"
          pendingLabel="Saving…"
          onClick={() => {
            if (intentRef.current) intentRef.current.value = 'publish';
          }}
        >
          Post Article
        </SubmitButton>
        <SubmitButton
          className="a-btn a-btn--secondary"
          pendingLabel="Saving…"
          onClick={() => {
            if (intentRef.current) intentRef.current.value = 'draft';
          }}
        >
          Save as Draft
        </SubmitButton>
        <button type="button" className="a-btn a-btn--ghost" onClick={goBack}>
          Back
        </button>
        {dirty && (
          <span className="a-hint" role="status">
            You have unsaved changes.
          </span>
        )}
      </div>
    </form>
  );
}
