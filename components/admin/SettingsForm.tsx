'use client';

import { useActionState } from 'react';
import ImageField from './ImageField';
import SubmitButton from './SubmitButton';
import { saveSettingsAction } from '@/app/admin/actions';
import type { ActionState, SettingsView } from '@/lib/types';

export default function SettingsForm({ settings }: { settings: SettingsView }) {
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    saveSettingsAction,
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

      {/* ---------------- Site ---------------- */}
      <div className="a-panel">
        <h2 className="a-panel-title">Site details</h2>
        <p className="a-panel-note">The name in the header, footer and browser tab.</p>

        <div className="a-row">
          <div className="a-field">
            <label className="a-label" htmlFor="siteName">
              Site name
            </label>
            <input id="siteName" name="siteName" className="a-input" defaultValue={settings.siteName} maxLength={80} />
          </div>
          <div className="a-field">
            <label className="a-label" htmlFor="siteTagline">
              Tagline
            </label>
            <input
              id="siteTagline"
              name="siteTagline"
              className="a-input"
              defaultValue={settings.siteTagline}
              maxLength={160}
            />
          </div>
        </div>

        <div className="a-field" style={{ marginBottom: 0 }}>
          <label className="a-label" htmlFor="siteDescription">
            Description for search engines
          </label>
          <textarea
            id="siteDescription"
            name="siteDescription"
            className="a-textarea"
            defaultValue={settings.siteDescription}
            maxLength={320}
            style={{ minHeight: '80px' }}
          />
        </div>
      </div>

      {/* ---------------- Hero ---------------- */}
      <div className="a-panel">
        <h2 className="a-panel-title">Homepage banner</h2>
        <p className="a-panel-note">
          The large photograph and headline at the top of the homepage. These are the same fields as
          the <strong>Status</strong> screen — edit them in either place.
        </p>

        <ImageField
          name="heroImage"
          label="Header banner image"
          purpose="hero"
          defaultValue={settings.heroImage}
        />

        <div className="a-row">
          <div className="a-field">
            <label className="a-label" htmlFor="heroEyebrow">
              Small heading above the name
            </label>
            <input
              id="heroEyebrow"
              name="heroEyebrow"
              className="a-input"
              defaultValue={settings.heroEyebrow}
              maxLength={120}
            />
          </div>
          <div className="a-field">
            <label className="a-label" htmlFor="heroHeading">
              Main heading
            </label>
            <input
              id="heroHeading"
              name="heroHeading"
              className="a-input"
              defaultValue={settings.heroHeading}
              maxLength={80}
            />
          </div>
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="heroText">
            Supporting text
          </label>
          <textarea
            id="heroText"
            name="heroText"
            className="a-textarea"
            defaultValue={settings.heroText}
            maxLength={400}
            style={{ minHeight: '90px' }}
          />
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

      {/* ---------------- Philosophy ---------------- */}
      <div className="a-panel">
        <h2 className="a-panel-title">Philosophy quote</h2>
        <p className="a-panel-note">The dark green band across the homepage.</p>
        <div className="a-field" style={{ marginBottom: 0 }}>
          <label className="a-label" htmlFor="philosophyQuote">
            Quote
          </label>
          <textarea
            id="philosophyQuote"
            name="philosophyQuote"
            className="a-textarea"
            defaultValue={settings.philosophyQuote}
            maxLength={320}
            style={{ minHeight: '80px' }}
          />
        </div>
      </div>

      {/* ---------------- About ---------------- */}
      <div className="a-panel">
        <h2 className="a-panel-title">About section</h2>
        <p className="a-panel-note">
          The photograph and introduction near the foot of the homepage, above the “Read more about
          me” button. Leave the statement or introduction empty and the homepage shows a short brief
          taken from the <strong>About Me</strong> page instead.
        </p>

        <ImageField
          name="aboutImage"
          label="About section image"
          purpose="about"
          defaultValue={settings.aboutImage}
        />

        <div className="a-row">
          <div className="a-field">
            <label className="a-label" htmlFor="aboutEyebrow">
              Small heading
            </label>
            <input
              id="aboutEyebrow"
              name="aboutEyebrow"
              className="a-input"
              defaultValue={settings.aboutEyebrow}
              maxLength={80}
            />
          </div>
          <div className="a-field">
            <label className="a-label" htmlFor="aboutCtaLabel">
              Button text
            </label>
            <input
              id="aboutCtaLabel"
              name="aboutCtaLabel"
              className="a-input"
              defaultValue={settings.aboutCtaLabel}
              maxLength={60}
            />
          </div>
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="aboutHeading">
            Large statement
          </label>
          <textarea
            id="aboutHeading"
            name="aboutHeading"
            className="a-textarea"
            defaultValue={settings.aboutHeading}
            maxLength={160}
            style={{ minHeight: '70px' }}
          />
          <span className="a-hint">
            Press Enter to split it across two lines, as in the design. Leave empty to use the About
            Me page title.
          </span>
        </div>

        <div className="a-field" style={{ marginBottom: 0 }}>
          <label className="a-label" htmlFor="aboutText">
            Introduction
          </label>
          <textarea
            id="aboutText"
            name="aboutText"
            className="a-textarea"
            defaultValue={settings.aboutText}
            maxLength={600}
          />
          <span className="a-hint">
            Leave empty to show the introduction from the About Me page.
          </span>
        </div>
      </div>

      {/* ---------------- Social ---------------- */}
      <div className="a-panel">
        <h2 className="a-panel-title">Social &amp; contact</h2>
        <p className="a-panel-note">
          These power every social icon on the site. Leave one empty to hide that icon.
        </p>

        <div className="a-field">
          <label className="a-label" htmlFor="linkedinUrl">
            LinkedIn address
          </label>
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            className="a-input"
            defaultValue={settings.linkedinUrl}
            placeholder="https://www.linkedin.com/in/your-profile"
            maxLength={300}
          />
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="instagramUrl">
            Instagram address
          </label>
          <input
            id="instagramUrl"
            name="instagramUrl"
            className="a-input"
            defaultValue={settings.instagramUrl}
            placeholder="https://www.instagram.com/your-profile"
            maxLength={300}
          />
        </div>

        <div className="a-field" style={{ marginBottom: 0 }}>
          <label className="a-label" htmlFor="emailAddress">
            Email address
          </label>
          <input
            id="emailAddress"
            name="emailAddress"
            type="email"
            className="a-input"
            defaultValue={settings.emailAddress}
            placeholder="you@example.com"
            maxLength={180}
          />
          <span className="a-hint">The email icon opens the visitor’s own email application.</span>
        </div>
      </div>

      {/* ---------------- Footer ---------------- */}
      <div className="a-panel">
        <h2 className="a-panel-title">Footer</h2>
        <p className="a-panel-note">The band at the very bottom of every page.</p>

        <ImageField
          name="footerImage"
          label="Footer background image"
          purpose="footer"
          defaultValue={settings.footerImage}
        />

        <div className="a-row" style={{ marginBottom: 0 }}>
          <div className="a-field" style={{ marginBottom: 0 }}>
            <label className="a-label" htmlFor="footerText">
              Footer line
            </label>
            <input
              id="footerText"
              name="footerText"
              className="a-input"
              defaultValue={settings.footerText}
              maxLength={200}
            />
          </div>
          <div className="a-field" style={{ marginBottom: 0 }}>
            <label className="a-label" htmlFor="footerCopyright">
              Copyright line
            </label>
            <input
              id="footerCopyright"
              name="footerCopyright"
              className="a-input"
              defaultValue={settings.footerCopyright}
              maxLength={120}
            />
            <span className="a-hint">The year is added automatically.</span>
          </div>
        </div>
      </div>

      <div className="a-actions a-actions--sticky">
        <SubmitButton pendingLabel="Saving…">Save settings</SubmitButton>
      </div>
    </form>
  );
}
