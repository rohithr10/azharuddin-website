'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logoutAction } from '@/app/admin/actions';

const PRIMARY = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/articles', label: 'Journal Articles' },
  { href: '/admin/articles/new', label: 'Add New Article' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/media', label: 'Media Library' },
];

const SITE = [
  { href: '/admin/status', label: 'Status' },
  { href: '/admin/featured-story', label: 'Featured Story' },
  { href: '/admin/pages', label: 'Website Pages' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/messages', label: 'Messages' },
];

export default function AdminShell({
  username,
  unreadCount,
  children,
}: {
  username: string;
  unreadCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const item = (entry: { href: string; label: string; exact?: boolean }) => (
    <Link key={entry.href} href={entry.href} data-active={isActive(entry.href, entry.exact) ? 'true' : 'false'}>
      <span>{entry.label}</span>
      {entry.href === '/admin/messages' && unreadCount > 0 && (
        <span className="a-badge a-badge--featured" style={{ marginLeft: 'auto' }}>
          {unreadCount}
        </span>
      )}
    </Link>
  );

  return (
    <div className="a-shell">
      <div className="a-topbar">
        <button
          type="button"
          className="a-btn a-btn--ghost"
          style={{ color: '#f3efe6' }}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          ☰ Menu
        </button>
        <span className="a-brand">AZHARUDDIN</span>
      </div>

      {open && <div className="a-backdrop" onClick={() => setOpen(false)} aria-hidden />}

      <aside className="a-sidebar" data-open={open ? 'true' : 'false'}>
        <div>
          <Link href="/admin" className="a-brand">
            AZHARUDDIN
          </Link>
          <p className="a-brand-sub">Content Manager</p>
        </div>

        <nav className="a-nav" aria-label="Admin">
          <span className="a-nav-label">Journal</span>
          {PRIMARY.map(item)}
          <span className="a-nav-label">Website</span>
          {SITE.map(item)}
        </nav>

        <div className="a-sidebar-foot">
          <span style={{ color: 'rgba(243,239,230,0.5)', fontSize: '0.75rem' }}>
            Signed in as {username}
          </span>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            View website ↗
          </Link>
          <form action={logoutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>

      <main className="a-main">{children}</main>
    </div>
  );
}
