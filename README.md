# Azharuddin — Personal Website & CMS

A production-ready personal-brand website with a database-backed journal and a
content manager, built so the site owner can run it without touching code.

---

## Quick start

```bash
npm install
npm run seed      # first admin user, starter categories, pages and demo articles
npm run dev       # http://localhost:3000
```

MongoDB must be running. The defaults in `.env.local` point at
`mongodb://localhost:27017/azharuddin_next`.

| Where | URL | Credentials |
| --- | --- | --- |
| Website | `/` | — |
| Content manager | `/admin` | `admin` / `admin123` |

**Change that password immediately** — Settings → Your password.

---

## The stack, and why

| Choice | Reason |
| --- | --- |
| **Next.js 15 (App Router)** | One codebase serves the public site and the CMS. Server Components keep database work on the server, so no data layer is exposed to the browser and pages ship very little JavaScript. |
| **MongoDB + Mongoose** | The content is document-shaped (an article with a category, an image, sections). Adding a field later needs a schema line, not a migration. Free hosting is available on MongoDB Atlas. |
| **Server Actions** | Form submissions call server functions directly. No hand-written API layer to keep in sync, and no chance of a public endpoint being left unguarded. |
| **Tiptap** | A real rich-text editor (headings, lists, quotes, links, images) that outputs clean HTML rather than a proprietary format. |
| **sharp** | Every upload is re-encoded, resized and compressed on the server, so a 4 MB phone photo becomes a ~40 KB WebP without the client thinking about it. |
| **Plain CSS + CSS Modules** | The design is bespoke and editorial. Hand-written CSS gives exact control over the typography and spacing, with no framework payload and nothing to fight. |
| **jose (signed cookie sessions)** | Small, standards-based, and works in Edge middleware so `/admin` is guarded before a page is ever rendered. |

Nothing here is included "just in case" — each dependency does a job the brief
asks for.

---

## Everything the owner can change without a developer

**Journal** — unlimited articles: write, edit, publish, unpublish, delete,
save as draft, upload/replace/remove the article image, set the SEO title and
description. Published articles appear on the homepage and in the Journal
automatically.

**Categories** — add, edit and delete. A category in use cannot be deleted
until its articles are moved or removed.

**Featured Story** — pick any published article for the large homepage panel,
or let it always show the newest one.

**Website Pages** — the wording, header image and sections of About Me,
My Views, Journal, Media and Contact.

**Status** — the homepage banner image and the status wording shown over it
(the line above the name, the name itself, the status sentence and the button).
The same fields also appear under Settings.

**Settings** — site name and description; the homepage banner; the philosophy
quote; the About image and text; the footer image and lines; LinkedIn,
Instagram and email.

**Article dates** — each article carries its own date, editable on the article
form. It drives the date badge on the cards, the article page and the ordering.

**Media Library** — every uploaded image, with its dimensions and file size.
Images still in use are labelled and protected from deletion.

**Messages** — everything sent through the contact form.

---

## Recommended image sizes

The CMS shows these next to every upload field. Larger images are accepted and
resized automatically rather than rejected.

These sizes are enforced, not suggested. Whatever is uploaded is resized and
centre-cropped to exactly these dimensions, so the layout never shifts because
of an odd photograph.

| Where | Stored size | Ratio |
| --- | --- | --- |
| Homepage banner | 1920 × 850 px | 16:9 |
| Featured story | 1200 × 675 px | 16:9 |
| Journal article | 1200 × 675 px | 16:9 |
| About section | 800 × 600 px | 4:3 |
| Footer background | 1920 × 300 px | ~6.4:1 |
| Media library | max 1600 px wide | kept as-is |

**File size:** any photo up to 30 MB can be uploaded straight from a phone or
camera — no need to resize or compress it first. Photos over 2 MB are
downscaled in the browser (never below 1.5× their final size, so no detail is
lost) before sending, which also keeps uploads under Vercel's 4.5 MB request
limit. The server then makes one high-quality resize and guarantees the stored
file is **under 2 MB** — in practice a banner is 0.3–0.5 MB. JPG, PNG or WebP
in; always stored as WebP.

Uploaded images are held in MongoDB and served from `/api/media/<id>.webp` with
immutable caching. That means uploads work on hosts with a read-only filesystem
(Vercel included) with no object store to set up, and images travel with the
database in a backup.

Until real photography is uploaded, the site falls back to the neutral images
in `public/placeholders/`. Every one of them is replaceable from the CMS.

**Social icons** appear on the homepage banner, the footer, the mobile menu and
the Contact page only once LinkedIn, Instagram or email are filled in under
Settings → Social & contact. They are hidden while those fields are empty.

---

## Project structure

```
app/
  (site)/            Public website — home, about-me, my-views, journal,
                     journal/[slug], media, contact
  admin/
    login/           Sign-in screen (outside the CMS shell)
    (dashboard)/     Dashboard, articles, categories, media, featured story,
                     pages, settings, messages
    actions.ts       Every server action (auth, articles, pages, settings…)
  api/
    search/          Public journal search
    contact/         Contact form submissions
    admin/upload/    Authenticated image upload
components/
  site/              Public-facing components
  admin/             CMS components
  ui/                Icons and the scroll-reveal wrapper
lib/
  db.ts models.ts    Database connection and schemas
  auth.ts            Session cookies, login throttling
  upload.ts          Image validation, resizing, storage, deletion
  sanitize.ts        HTML sanitisation for anything user-authored
  data.ts            Read helpers, all serialised for the client
  image-specs.ts     One source of truth for the sizes shown in the CMS
middleware.ts        Guards every /admin route
scripts/
  seed.mjs           First-run content
  make-placeholders.mjs
public/uploads/      Uploaded images (not in version control)
```

---

## Data model

```
User      username, passwordHash
Category  name, slug, description
Article   title, slug, category → Category, excerpt, content, image, imageAlt,
          status (draft|published), publishedAt, seoTitle, seoDescription,
          readingMinutes, timestamps
Page      key (about-me | my-views | journal | media | contact), title, eyebrow,
          intro, body, image, sections[{heading, body, image, link, meta}], seo
Media     url, filename, dimensions, size, alt, purpose
Settings  one document: site, hero, philosophy, about, footer, social,
          featuredArticle → Article
Message   name, email, subject, message, read
```

Adding an article never requires a schema or code change.

---

## Security

- Admin routes are blocked in Edge middleware before rendering; every server
  action re-checks the session independently.
- Passwords are hashed with bcrypt (cost 12). Sessions are signed JWTs in
  `httpOnly`, `sameSite=lax` cookies, `secure` in production.
- Failed logins are throttled per IP and username.
- Uploads: type and size checked, re-encoded through sharp (which strips any
  payload hidden in the original file), stored under a generated filename.
  Deletion is confined to `public/uploads`.
- All CMS-authored HTML is sanitised on save; contact-form input is stripped of
  markup entirely.
- The contact form is rate-limited per IP and has a honeypot field.

---

## Deploying

### Environment variables (required on every host)

`.env.local` is git-ignored and **is never deployed**. Set these in your hosting
platform's dashboard, then redeploy:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | A MongoDB Atlas string: `mongodb+srv://user:pass@cluster.mongodb.net/azharuddin` |
| `SESSION_SECRET` | At least 32 random characters |
| `NEXT_PUBLIC_SITE_URL` | The real domain, e.g. `https://azharuddin.com` |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Is it configured correctly?

Visit **`/api/health`** on the deployed site. It reports which variables are
missing, whether the database is reachable, how many articles it can see, and
what to do about each failure. It never reveals credentials.

### MongoDB Atlas checklist

1. Create a free cluster.
2. **Database Access** → add a user, and note the password. URL-encode any
   special characters when you paste it into the connection string.
3. **Network Access** → Add IP Address → **Allow access from anywhere
   (`0.0.0.0/0`)**. Serverless functions have no fixed IP, so a narrower
   allowlist blocks the site.
4. Copy the string from **Connect → Drivers** and add the database name after
   the host: `.../azharuddin?retryWrites=true&w=majority`.
5. Seed that database once, from your machine:

   ```bash
   MONGODB_URI="<your atlas string>" npm run seed
   ```

### Vercel

Everything runs on Vercel, image uploads included: they are stored in MongoDB
rather than on disk, so the read-only filesystem is not a problem and there is
no object store to configure. Set the three environment variables above, make
sure Atlas allows `0.0.0.0/0`, and deploy.

## Going live

1. Point `MONGODB_URI` at MongoDB Atlas (or your own server).
2. Set a `SESSION_SECRET` of at least 32 random characters.
3. Set `NEXT_PUBLIC_SITE_URL` to the real domain — it is used for canonical
   URLs, Open Graph tags, the sitemap and article sharing links.
4. `npm run build && npm start`, behind HTTPS.
5. Sign in and change the admin password.

```bash
npm run build
npm start
```

**Hosting note:** uploaded images live in MongoDB, so the app is portable to any
host — serverless or not — with no storage service to configure. If the library
ever grows large enough to warrant a CDN, `lib/upload.ts` is the single place
that touches storage.

---

## Removing the demo content

The seed script adds four sample articles and starter page copy so the site is
not empty on first run. Delete the articles in the CMS and rewrite the pages
under Website Pages; nothing depends on them.
