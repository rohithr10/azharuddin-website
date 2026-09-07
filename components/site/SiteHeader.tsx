'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV_LINKS } from './nav-links';
import SearchOverlay from './SearchOverlay';
import styles from './SiteHeader.module.css';
import {
  CloseIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  MenuIcon,
  SearchIcon,
} from '@/components/ui/icons';
import { mailtoUrl, safeUrl } from '@/lib/utils';
import type { SettingsView } from '@/lib/types';

export default function SiteHeader({ settings }: { settings: SettingsView }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while a full-screen layer is open.
  useEffect(() => {
    document.body.classList.toggle('no-scroll', menuOpen || searchOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const linkedin = safeUrl(settings.linkedinUrl);
  const instagram = safeUrl(settings.instagramUrl);
  const email = mailtoUrl(settings.emailAddress);

  return (
    <>
      <header className={styles.header} data-transparent={isHome && !scrolled ? 'true' : 'false'}>
        <div className={`container ${styles.inner}`}>
          <Link href="/" className={styles.logo} aria-label={`${settings.siteName} — home`}>
            {settings.siteName || 'AZHARUDDIN'}
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.link}
                data-active={pathname.startsWith(item.href) ? 'true' : 'false'}
                aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setSearchOpen(true)}
              aria-label="Search articles"
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.burger}`}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={styles.mobilePanel}
        data-open={menuOpen ? 'true' : 'false'}
        aria-hidden={!menuOpen}
        {...(!menuOpen ? { inert: true } : {})}
      >
        <div className={styles.mobileTop}>
          <Link href="/" className={styles.logo}>
            {settings.siteName || 'AZHARUDDIN'}
          </Link>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className={styles.mobileNav} aria-label="Mobile">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileLink}
              data-active={pathname.startsWith(item.href) ? 'true' : 'false'}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.mobileFooter}>
          {linkedin && (
            <a
              href={linkedin}
              className={styles.mobileSocial}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <LinkedInIcon size={18} />
            </a>
          )}
          {instagram && (
            <a
              href={instagram}
              className={styles.mobileSocial}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon size={18} />
            </a>
          )}
          {email && (
            <a href={email} className={styles.mobileSocial} aria-label="Email">
              <MailIcon size={18} />
            </a>
          )}
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
