/**
 * Generates the default imagery shipped with the site. Every one of these is
 * replaceable from the CMS — they exist so the layout reads correctly before
 * the client uploads their own photography.
 *
 *   node scripts/make-placeholders.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT = path.join(process.cwd(), 'public', 'placeholders');

function sprig(x, y, scale, opacity) {
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="#c9a961" stroke-width="1.4"
     stroke-linecap="round" opacity="${opacity}">
    <path d="M0 160V16" />
    <path d="M0 44c0-12 9-21 21-22 1 12-8 22-21 22Z" />
    <path d="M0 44c0-12-9-21-21-22-1 12 8 22 21 22Z" />
    <path d="M0 78c0-12 9-21 21-22 1 12-8 22-21 22Z" />
    <path d="M0 78c0-12-9-21-21-22-1 12 8 22 21 22Z" />
    <path d="M0 112c0-12 9-21 21-22 1 12-8 22-21 22Z" />
    <path d="M0 112c0-12-9-21-21-22-1 12 8 22 21 22Z" />
  </g>`;
}

function ridges(width, height, baseline) {
  const layers = [
    { y: baseline, color: '#2b3326', points: 7, amp: 0.16 },
    { y: baseline + height * 0.06, color: '#232a1f', points: 5, amp: 0.12 },
    { y: baseline + height * 0.13, color: '#1a2018', points: 4, amp: 0.09 },
  ];

  return layers
    .map((layer) => {
      const step = width / layer.points;
      let d = `M0 ${height} L0 ${layer.y}`;
      for (let i = 0; i <= layer.points; i += 1) {
        const peak = layer.y - height * layer.amp * (0.55 + Math.abs(Math.sin(i * 1.7)) * 0.75);
        d += ` L${(i * step + step / 2).toFixed(1)} ${peak.toFixed(1)} L${((i + 1) * step).toFixed(1)} ${layer.y.toFixed(1)}`;
      }
      d += ` L${width} ${height} Z`;
      return `<path d="${d}" fill="${layer.color}" />`;
    })
    .join('\n');
}

function scene({ width, height, from, to, glow, withRidges = true, sprigs = true }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="${from}" />
      <stop offset="58%" stop-color="${to}" />
      <stop offset="100%" stop-color="#14150f" />
    </linearGradient>
    <radialGradient id="sun" cx="0.68" cy="0.42" r="0.42">
      <stop offset="0%" stop-color="${glow}" stop-opacity="0.85" />
      <stop offset="100%" stop-color="${glow}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#sky)" />
  <rect width="${width}" height="${height}" fill="url(#sun)" />
  ${withRidges ? ridges(width, height, height * 0.62) : ''}
  ${sprigs ? sprig(width * 0.12, height * 0.24, height / 620, 0.24) : ''}
  ${sprigs ? sprig(width * 0.9, height * 0.3, height / 520, 0.16) : ''}
  <rect width="${width}" height="${height}" fill="#14150f" opacity="0.14" />
</svg>`;
}

const FILES = [
  {
    name: 'hero.jpg',
    svg: scene({ width: 1920, height: 850, from: '#3a3526', to: '#6a5334', glow: '#d8a86a' }),
  },
  {
    name: 'featured.jpg',
    svg: scene({ width: 1200, height: 750, from: '#2f3a2c', to: '#4f5f3d', glow: '#9fb27a' }),
  },
  {
    name: 'article.jpg',
    svg: scene({ width: 1200, height: 675, from: '#2b3430', to: '#54604a', glow: '#c9a961' }),
  },
  {
    name: 'about.jpg',
    svg: scene({ width: 900, height: 1100, from: '#33372a', to: '#5d5b40', glow: '#c9a961' }),
  },
  {
    name: 'footer.jpg',
    svg: scene({
      width: 1920,
      height: 300,
      from: '#1b1e16',
      to: '#2a3122',
      glow: '#7d8a5f',
      withRidges: false,
    }),
  },
];

await mkdir(OUT, { recursive: true });

for (const file of FILES) {
  const buffer = await sharp(Buffer.from(file.svg)).jpeg({ quality: 82, progressive: true }).toBuffer();
  await writeFile(path.join(OUT, file.name), buffer);
  console.log(`✓ ${file.name} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

console.log('\nPlaceholder imagery written to public/placeholders/');
