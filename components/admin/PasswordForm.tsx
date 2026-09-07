'use client';

import { useActionState } from 'react';
import SubmitButton from './SubmitButton';
import { changePasswordAction } from '@/app/admin/actions';
import type { ActionState } from '@/lib/types';

export default function PasswordForm() {
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    changePasswordAction,
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

      <div className="a-field">
        <label className="a-label" htmlFor="currentPassword">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          className="a-input"
          autoComplete="current-password"
          required
        />
      </div>

      <div className="a-row">
        <div className="a-field">
          <label className="a-label" htmlFor="newPassword">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            className="a-input"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <span className="a-hint">At least 8 characters.</span>
        </div>
        <div className="a-field">
          <label className="a-label" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="a-input"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
      </div>

      <SubmitButton pendingLabel="Saving…">Change password</SubmitButton>
    </form>
  );
}
