'use client';

import { useActionState } from 'react';
import { loginAction } from '../actions';
import SubmitButton from '@/components/admin/SubmitButton';
import type { ActionState } from '@/lib/types';

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    loginAction,
    undefined
  );

  return (
    <form action={formAction}>
      {state?.error && (
        <p className="a-notice a-notice--error" role="alert">
          {state.error}
        </p>
      )}

      <input type="hidden" name="next" value={next ?? '/admin'} />

      <div className="a-field">
        <label className="a-label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          className="a-input"
          autoComplete="username"
          required
          autoFocus
        />
      </div>

      <div className="a-field">
        <label className="a-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="a-input"
          autoComplete="current-password"
          required
        />
      </div>

      <SubmitButton className="a-btn a-btn--primary" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
