'use client';

import { useFormStatus } from 'react-dom';

type Props = {
  children: React.ReactNode;
  className?: string;
  name?: string;
  value?: string;
  pendingLabel?: string;
  onClick?: () => void;
};

export default function SubmitButton({
  children,
  className = 'a-btn a-btn--primary',
  name,
  value,
  pendingLabel,
  onClick,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} name={name} value={value} disabled={pending} onClick={onClick}>
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
