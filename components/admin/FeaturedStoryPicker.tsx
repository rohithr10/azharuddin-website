'use client';

import { useActionState, useState } from 'react';
import SubmitButton from './SubmitButton';
import { setFeaturedStoryAction } from '@/app/admin/actions';
import { PLACEHOLDER, withFallback } from '@/lib/placeholders';
import { formatDate } from '@/lib/utils';
import type { ActionState, ArticleView } from '@/lib/types';

export default function FeaturedStoryPicker({
  articles,
  currentId,
}: {
  articles: ArticleView[];
  currentId: string | null;
}) {
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    setFeaturedStoryAction,
    undefined
  );
  const [selected, setSelected] = useState(currentId ?? '');

  return (
    <form action={formAction}>
      {state?.error && (
        <p className="a-notice a-notice--error" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && state.message && (
        <p className="a-notice a-notice--success" role="status">
          {state.message}
        </p>
      )}

      <label className="a-choice" data-selected={selected === '' ? 'true' : 'false'}>
        <input
          type="radio"
          name="articleId"
          value=""
          checked={selected === ''}
          onChange={() => setSelected('')}
        />
        <span />
        <span>
          <strong>Use the newest published article</strong>
          <span style={{ display: 'block', color: 'var(--a-muted)', fontSize: '0.82rem' }}>
            The homepage always shows your most recent story.
          </span>
        </span>
        <span />
      </label>

      {articles.map((article) => (
        <label
          className="a-choice"
          key={article.id}
          data-selected={selected === article.id ? 'true' : 'false'}
        >
          <input
            type="radio"
            name="articleId"
            value={article.id}
            checked={selected === article.id}
            onChange={() => setSelected(article.id)}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withFallback(article.image, PLACEHOLDER.article)} alt="" />
          <span>
            <strong>{article.title}</strong>
            <span style={{ display: 'block', color: 'var(--a-muted)', fontSize: '0.82rem' }}>
              {article.category?.name ?? 'Uncategorised'} · {formatDate(article.publishedAt)}
            </span>
          </span>
          {currentId === article.id && <span className="a-badge a-badge--featured">Current</span>}
        </label>
      ))}

      <div className="a-actions" style={{ marginTop: '1.5rem' }}>
        <SubmitButton pendingLabel="Saving…">Save featured story</SubmitButton>
      </div>
    </form>
  );
}
