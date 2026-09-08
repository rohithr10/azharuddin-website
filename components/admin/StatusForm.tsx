'use client';

import { useActionState } from 'react';
import ImageField from './ImageField';
import SubmitButton from './SubmitButton';
import { saveStatusAction } from '@/app/admin/actions';
import type { ActionState, SettingsView } from '@/lib/types';

/**
 * The "Status" screen: the header banner image and the wording that sits over
 * it on the homepage — the two things the owner changes most often.
 */
export default function StatusForm({ settings }: { settings: SettingsView }) {
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    saveStatusAction,
    undefined
  );

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

      <div className="a-panel">
        <h2 className="a-panel-title">Header banner image</h2>
        <p className="a-panel-note">
          The large photograph at the very top of the homepage, behind the name and the status
          wording.
        </p>

        <ImageField
          name="heroImage"
          label="Banner image"
          purpose="hero"
          defaultValue={settings.heroImage}
        />
      </div>

      <div className="a-panel">
        <h2 className="a-panel-title">Status</h2>
        <p className="a-panel-note">
          The wording shown on the banner. The status line sits underneath the name.
        </p>

        <div className="a-field">
          <label className="a-label" htmlFor="heroEyebrow">
            Line above the name
          </label>
          <input
            id="heroEyebrow"
            name="heroEyebrow"
            className="a-input"
            defaultValue={settings.heroEyebrow}
            maxLength={120}
            placeholder="HUMANITARIAN. NATURE LOVER."
          />
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="heroHeading">
            Name
          </label>
          <input
            id="heroHeading"
            name="heroHeading"
            className="a-input"
            defaultValue={settings.heroHeading}
            maxLength={80}
          />
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="heroText">
            Status <span className="a-required">*</span>
          </label>
          <textarea
            id="heroText"
            name="heroText"
            className="a-textarea"
            defaultValue={settings.heroText}
            maxLength={400}
            placeholder="Sharing thoughts on life, leadership, humanity and our responsibility towards creating a better world."
            style={{ minHeight: '110px' }}
          />
          <span className="a-hint">
            This is the sentence under the name on the banner.
          </span>
        </div>

        <div className="a-row">
          <div className="a-field">
            <label className="a-label" htmlFor="heroCtaLabel">
              Button text
            </label>
            <input
              id="heroCtaLabel"
              name="heroCtaLabel"
              className="a-input"
              defaultValue={settings.heroCtaLabel}
              maxLength={60}
            />
          </div>
          <div className="a-field">
            <label className="a-label" htmlFor="heroCtaHref">
              Button goes to
            </label>
            <select
              id="heroCtaHref"
              name="heroCtaHref"
              className="a-select"
              defaultValue={settings.heroCtaHref || '/my-views'}
            >
              <option value="/my-views">My Views</option>
              <option value="/journal">Journal</option>
              <option value="/about-me">About Me</option>
              <option value="/contact">Contact</option>
            </select>
          </div>
        </div>

        <div className="a-field" style={{ marginBottom: 0 }}>
          <label className="a-label" htmlFor="heroRailText">
            Vertical decorative text
          </label>
          <input
            id="heroRailText"
            name="heroRailText"
            className="a-input"
            defaultValue={settings.heroRailText}
            maxLength={80}
          />
          <span className="a-hint">Shown sideways down the left edge of the banner.</span>
        </div>
      </div>

      <div className="a-actions a-actions--sticky">
        <SubmitButton pendingLabel="Saving…">Save status</SubmitButton>
      </div>
    </form>
  );
}
