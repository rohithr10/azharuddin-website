'use client';

type Props = {
  children: React.ReactNode;
  message: string;
  className?: string;
  disabled?: boolean;
  title?: string;
};

/** Submit button that asks for confirmation before a destructive action. */
export default function ConfirmSubmit({
  children,
  message,
  className = 'a-btn a-btn--danger',
  disabled,
  title,
}: Props) {
  return (
    <button
      type="submit"
      className={className}
      disabled={disabled}
      title={title}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
