'use client';

import { useState } from 'react';

export default function CopyButton({ value, label = 'Copy address' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="a-btn a-btn--secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt('Copy this image address:', value);
        }
      }}
    >
      {copied ? 'Copied' : label}
    </button>
  );
}
