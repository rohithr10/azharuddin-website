'use client';

import { useActionState, useState } from 'react';
import ImageField from './ImageField';
import RichTextEditor from './RichTextEditor';
import SubmitButton from './SubmitButton';
import { savePageAction } from '@/app/admin/actions';
import type { ActionState, PageSectionView, PageView } from '@/lib/types';

type SectionConfig = {
  label: string;
  singular: string;
  useImage: boolean;
  useLink: boolean;
  useMeta: boolean;
  metaLabel: string;
  hint: string;
};

const SECTION_CONFIG: Record<string, SectionConfig> = {
  'about-me': {
    label: 'Story sections',
    singular: 'section',
    useImage: true,
    useLink: false,
    useMeta: true,
    metaLabel: 'Small heading above the title',
    hint: 'Each section becomes an image-and-text block further down the About page.',
  },
  'my-views': {
    label: 'Viewpoints',
    singular: 'viewpoint',
    useImage: false,
    useLink: false,
    useMeta: false,
    metaLabel: '',
    hint: 'Each viewpoint becomes a numbered card on the My Views page.',
  },
  media: {
    label: 'Media features',
    singular: 'feature',
    useImage: true,
    useLink: true,
    useMeta: true,
    metaLabel: 'Type and date (e.g. “Interview · 2026”)',
    hint: 'Each feature becomes a row on the Media page, linking out if you add an address.',
  },
  contact: {
    label: 'Extra sections',
    singular: 'section',
    useImage: false,
    useLink: false,
    useMeta: false,
    metaLabel: '',
    hint: 'Optional extra notes shown on the Contact page.',
  },
  journal: {
    label: 'Extra sections',
    singular: 'section',
    useImage: false,
    useLink: false,
    useMeta: false,
    metaLabel: '',
    hint: 'Not used on the Journal page — the article list is generated automatically.',
  },
};

let localId = 0;

export default function PageEditor({ page, pageKey }: { page: PageView | null; pageKey: string }) {
  const config = SECTION_CONFIG[pageKey] ?? SECTION_CONFIG.contact;
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    savePageAction,
    undefined
  );
  const [sections, setSections] = useState<Array<PageSectionView & { key: string }>>(
    (page?.sections ?? []).map((section, index) => ({ ...section, key: `s${index}` }))
  );

  function addSection() {
    localId += 1;
    setSections((current) => [
      ...current,
      { id: '', heading: '', body: '', image: '', link: '', meta: '', key: `new-${localId}` },
    ]);
  }

  function removeSection(key: string) {
    if (!window.confirm(`Remove this ${config.singular}?`)) return;
    setSections((current) => current.filter((section) => section.key !== key));
  }

  function move(key: string, direction: -1 | 1) {
    setSections((current) => {
      const index = current.findIndex((section) => section.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

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

      <input type="hidden" name="key" value={pageKey} />

      <div className="a-panel">
        <h2 className="a-panel-title">Page header</h2>
        <p className="a-panel-note">
          The band at the top of the page. Add an image for a full-width photographic header.
        </p>

        <div className="a-row">
          <div className="a-field">
            <label className="a-label" htmlFor="eyebrow">
              Small heading
            </label>
            <input
              id="eyebrow"
              name="eyebrow"
              className="a-input"
              defaultValue={page?.eyebrow ?? ''}
              maxLength={80}
            />
          </div>
          <div className="a-field">
            <label className="a-label" htmlFor="title">
              Page title <span className="a-required">*</span>
            </label>
            <input
              id="title"
              name="title"
              className="a-input"
              defaultValue={page?.title ?? ''}
              maxLength={160}
              required
            />
          </div>
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="intro">
            Introduction
          </label>
          <textarea
            id="intro"
            name="intro"
            className="a-textarea"
            defaultValue={page?.intro ?? ''}
            maxLength={600}
            style={{ minHeight: '90px' }}
          />
        </div>

        <ImageField
          name="image"
          label="Header image"
          purpose="hero"
          defaultValue={page?.image ?? ''}
        />
      </div>

      <div className="a-panel">
        <h2 className="a-panel-title">Main content</h2>
        <p className="a-panel-note">The body of the page.</p>
        <RichTextEditor
          name="body"
          defaultValue={page?.body ?? ''}
          placeholder="Write the page content here…"
        />
      </div>

      {pageKey !== 'journal' && (
        <div className="a-panel">
          <h2 className="a-panel-title">{config.label}</h2>
          <p className="a-panel-note">{config.hint}</p>

          {sections.length === 0 && (
            <p className="a-empty" style={{ marginBottom: '1rem' }}>
              No {config.label.toLowerCase()} yet.
            </p>
          )}

          {sections.map((section, index) => (
            <div
              key={section.key}
              className="a-panel"
              style={{ marginTop: index === 0 ? 0 : '1rem', background: '#faf8f4' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  gap: '0.5rem',
                }}
              >
                <strong style={{ fontSize: '0.85rem' }}>
                  {config.singular.charAt(0).toUpperCase() + config.singular.slice(1)} {index + 1}
                </strong>
                <div className="a-actions">
                  <button
                    type="button"
                    className="a-btn a-btn--ghost"
                    onClick={() => move(section.key, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="a-btn a-btn--ghost"
                    onClick={() => move(section.key, 1)}
                    disabled={index === sections.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="a-btn a-btn--danger"
                    onClick={() => removeSection(section.key)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {config.useMeta && (
                <div className="a-field">
                  <label className="a-label">{config.metaLabel}</label>
                  <input
                    className="a-input"
                    name={`sections[${index}][meta]`}
                    defaultValue={section.meta}
                    maxLength={120}
                  />
                </div>
              )}

              <div className="a-field">
                <label className="a-label">Heading</label>
                <input
                  className="a-input"
                  name={`sections[${index}][heading]`}
                  defaultValue={section.heading}
                  maxLength={160}
                />
              </div>

              <div className="a-field">
                <label className="a-label">Text</label>
                <RichTextEditor
                  name={`sections[${index}][body]`}
                  defaultValue={section.body}
                  placeholder="Write this section…"
                  minimal
                />
              </div>

              {config.useLink && (
                <div className="a-field">
                  <label className="a-label">Link address</label>
                  <input
                    className="a-input"
                    name={`sections[${index}][link]`}
                    defaultValue={section.link}
                    maxLength={300}
                    placeholder="https://…"
                  />
                </div>
              )}

              {config.useImage ? (
                <ImageField
                  name={`sections[${index}][image]`}
                  label="Section image"
                  purpose="featured"
                  defaultValue={section.image}
                />
              ) : (
                <input type="hidden" name={`sections[${index}][image]`} value={section.image} />
              )}
            </div>
          ))}

          <div className="a-actions" style={{ marginTop: '1.25rem' }}>
            <button type="button" className="a-btn a-btn--secondary" onClick={addSection}>
              + Add {config.singular}
            </button>
          </div>
        </div>
      )}

      <div className="a-panel">
        <h2 className="a-panel-title">Search engine listing</h2>
        <p className="a-panel-note">Optional. Leave empty to use the title and introduction.</p>
        <div className="a-row" style={{ marginBottom: 0 }}>
          <div className="a-field" style={{ marginBottom: 0 }}>
            <label className="a-label" htmlFor="seoTitle">
              SEO title
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              className="a-input"
              defaultValue={page?.seoTitle ?? ''}
              maxLength={120}
            />
          </div>
          <div className="a-field" style={{ marginBottom: 0 }}>
            <label className="a-label" htmlFor="seoDescription">
              SEO description
            </label>
            <input
              id="seoDescription"
              name="seoDescription"
              className="a-input"
              defaultValue={page?.seoDescription ?? ''}
              maxLength={300}
            />
          </div>
        </div>
      </div>

      <div className="a-actions a-actions--sticky">
        <SubmitButton pendingLabel="Saving…">Save page</SubmitButton>
      </div>
    </form>
  );
}
