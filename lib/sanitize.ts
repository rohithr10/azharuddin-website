import sanitizeHtml from 'sanitize-html';

/**
 * Article bodies are authored in the CMS by a signed-in administrator, but we
 * still sanitize on save so a compromised session cannot persist script tags.
 */
export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty ?? '', {
    allowedTags: [
      'p', 'br', 'hr',
      'h2', 'h3', 'h4',
      'strong', 'b', 'em', 'i', 'u', 's',
      'ul', 'ol', 'li',
      'blockquote',
      'a', 'img',
      'figure', 'figcaption',
      'code', 'pre',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(attribs.href && /^https?:\/\//i.test(attribs.href)
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {}),
        },
      }),
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: 'lazy' },
      }),
    },
    // Relative /uploads/... image sources must survive sanitization.
    allowProtocolRelative: false,
    allowedSchemesAppliedToAttributes: ['href'],
  });
}

/** Plain text fields (headings, excerpts) — strip all markup. */
export function sanitizeText(value: unknown, maxLength = 2000): string {
  if (typeof value !== 'string') return '';
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);
}
