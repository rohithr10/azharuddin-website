'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import ConfirmSubmit from './ConfirmSubmit';
import SubmitButton from './SubmitButton';
import { deleteCategoryAction, saveCategoryAction } from '@/app/admin/actions';
import type { ActionState, CategoryView } from '@/lib/types';

export default function CategoryManager({ categories }: { categories: CategoryView[] }) {
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    saveCategoryAction,
    undefined
  );
  const [editing, setEditing] = useState<CategoryView | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setEditing(null);
    }
  }, [state]);

  return (
    <div className="a-grid-2" style={{ alignItems: 'start' }}>
      <div className="a-panel">
        <h2 className="a-panel-title">{editing ? 'Edit category' : 'Add a new category'}</h2>
        <p className="a-panel-note">
          Categories group your articles — Nature, Life, Leadership, and any others you want.
        </p>

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

        <form action={formAction} ref={formRef} key={editing?.id ?? 'new'}>
          <input type="hidden" name="id" value={editing?.id ?? ''} />

          <div className="a-field">
            <label className="a-label" htmlFor="name">
              Category name <span className="a-required">*</span>
            </label>
            <input
              id="name"
              name="name"
              className="a-input"
              defaultValue={editing?.name ?? ''}
              maxLength={80}
              required
              placeholder="e.g. Travel"
            />
          </div>

          <div className="a-field">
            <label className="a-label" htmlFor="description">
              Description
            </label>
            <input
              id="description"
              name="description"
              className="a-input"
              defaultValue={editing?.description ?? ''}
              maxLength={300}
              placeholder="Optional — a short note for your own reference"
            />
          </div>

          <div className="a-actions">
            <SubmitButton pendingLabel="Saving…">
              {editing ? 'Save changes' : 'Add category'}
            </SubmitButton>
            {editing && (
              <button
                type="button"
                className="a-btn a-btn--ghost"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="a-panel">
        <h2 className="a-panel-title">Your categories</h2>
        <p className="a-panel-note">
          A category can only be deleted once no articles are using it.
        </p>

        {categories.length === 0 ? (
          <p className="a-empty">No categories yet.</p>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table" style={{ minWidth: 'auto' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Articles</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <span className="a-cell-title">{category.name}</span>
                      {category.description && (
                        <div style={{ color: 'var(--a-muted)', fontSize: '0.78rem' }}>
                          {category.description}
                        </div>
                      )}
                    </td>
                    <td>{category.articleCount ?? 0}</td>
                    <td>
                      <div className="a-cell-actions">
                        <button
                          type="button"
                          className="a-btn a-btn--secondary"
                          onClick={() => setEditing(category)}
                        >
                          Edit
                        </button>
                        <form action={deleteCategoryAction}>
                          <input type="hidden" name="id" value={category.id} />
                          <ConfirmSubmit
                            message={`Delete the category “${category.name}”?`}
                            disabled={(category.articleCount ?? 0) > 0}
                            title={
                              (category.articleCount ?? 0) > 0
                                ? 'Move or delete its articles first'
                                : undefined
                            }
                          >
                            Delete
                          </ConfirmSubmit>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
