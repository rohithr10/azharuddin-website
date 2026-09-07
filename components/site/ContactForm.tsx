'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';
import { ArrowRight } from '@/components/ui/icons';

type Status = { tone: 'idle' | 'error' | 'success'; message: string };

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ tone: 'idle', message: '' });
  const [sending, setSending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setSending(true);
    setStatus({ tone: 'idle', message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        setStatus({ tone: 'error', message: result.error || 'Something went wrong.' });
      } else {
        setStatus({
          tone: 'success',
          message: 'Thank you — your message has been received.',
        });
        form.reset();
      }
    } catch {
      setStatus({ tone: 'error', message: 'Could not send the message. Please try again.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate={false}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-name">
            Your name
          </label>
          <input
            id="contact-name"
            name="name"
            className={styles.input}
            type="text"
            required
            maxLength={120}
            autoComplete="name"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-email">
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            className={styles.input}
            type="email"
            required
            maxLength={180}
            autoComplete="email"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contact-subject">
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          className={styles.input}
          type="text"
          maxLength={160}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          className={styles.textarea}
          required
          maxLength={4000}
        />
      </div>

      {/* Simple bot trap — real people never fill this in. */}
      <div className={styles.honey} aria-hidden>
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.actions}>
        <button type="submit" className="btn btn--solid-forest" disabled={sending}>
          {sending ? 'Sending…' : 'Send Message'}
          <ArrowRight size={16} />
        </button>
        {status.message && (
          <p className={styles.note} data-tone={status.tone} role="status" aria-live="polite">
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
