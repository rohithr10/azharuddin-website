import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: 'false' as const,
};

export function ArrowRight({ size = 18, ...props }: IconProps & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowLeft({ size = 18, ...props }: IconProps & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M20 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  );
}

export function SearchIcon({ size = 20, ...props }: IconProps & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function MenuIcon({ size = 22, ...props }: IconProps & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function CloseIcon({ size = 22, ...props }: IconProps & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function LinkedInIcon({ size = 16, ...props }: IconProps & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.65h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.65c0-1.35-.03-3.08-1.93-3.08-1.93 0-2.23 1.46-2.23 2.98V21h-4V9Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 16, ...props }: IconProps & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={1.6} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MailIcon({ size = 16, ...props }: IconProps & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={1.6} {...props}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3 6.5 9 6 9-6" />
    </svg>
  );
}

/** Fine botanical sprig used as a decorative accent (hero rail, about, quote). */
export function Sprig({ size = 120, ...props }: IconProps & { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 100 160"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      <path d="M50 158V16" />
      <path d="M50 44c0-12 9-21 21-22 1 12-8 22-21 22Z" />
      <path d="M50 44c0-12-9-21-21-22-1 12 8 22 21 22Z" />
      <path d="M50 74c0-12 9-21 21-22 1 12-8 22-21 22Z" />
      <path d="M50 74c0-12-9-21-21-22-1 12 8 22 21 22Z" />
      <path d="M50 104c0-12 9-21 21-22 1 12-8 22-21 22Z" />
      <path d="M50 104c0-12-9-21-21-22-1 12 8 22 21 22Z" />
      <path d="M50 16c-4-6-3-11 0-16 3 5 4 10 0 16Z" />
    </svg>
  );
}

export function QuoteMark({ size = 54, ...props }: IconProps & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 36" fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M0 36V21.6C0 9.6 6.2 1.4 18.7 0l1.8 5.4c-6.7 1.3-10.3 5.2-10.6 10.4H20V36H0Zm27.5 0V21.6C27.5 9.6 33.7 1.4 46.2 0L48 5.4c-6.7 1.3-10.3 5.2-10.6 10.4h10.1V36H27.5Z" />
    </svg>
  );
}
