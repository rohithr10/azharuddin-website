'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  as?: 'div' | 'section' | 'article' | 'li';
  delay?: number;
  className?: string;
};

/**
 * Fades content in once as it scrolls into view. Users who ask for reduced
 * motion get the content immediately, with no transition at all.
 */
export default function Reveal({ children, as = 'div', delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.06 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as as any;
  return (
    <Tag
      ref={ref}
      className={['reveal', className].filter(Boolean).join(' ')}
      data-visible={visible ? 'true' : 'false'}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
