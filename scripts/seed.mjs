/**
 * Creates the first admin user, the starter categories, the editable pages and
 * three sample journal articles.
 *
 *   npm run seed
 *
 * Safe to re-run: nothing that already exists is overwritten.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/azharuddin_next';
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const { Schema } = mongoose;
const loose = { strict: false, timestamps: true };

const User = mongoose.model('User', new Schema({}, loose));
const Category = mongoose.model('Category', new Schema({}, loose));
const Article = mongoose.model('Article', new Schema({}, loose));
const Page = mongoose.model('Page', new Schema({}, loose));
const Settings = mongoose.model('Settings', new Schema({}, loose));

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
}

const CATEGORIES = ['Nature', 'Life', 'Leadership', 'Humanity'];

const ARTICLES = [
  {
    title: 'Lessons from Nature That Stay With Us',
    category: 'Nature',
    excerpt:
      'Nature has always been a teacher, reminding us of the simple truths that often get lost in the noise of life.',
    content: `<p>There is a particular quiet that settles over a forest just before dawn. It is not silence — the world is very much awake — but it is a quiet that asks something of you: to slow down, to notice, to stop insisting that everything happen at your pace.</p>
<p>I have spent a great deal of my life in places like this, and they have taught me more about leadership and responsibility than any boardroom ever has.</p>
<h2>Patience is not passivity</h2>
<p>A tree does not rush. It grows in the direction of light, adjusts around obstacles, and gives shade long before anyone thinks to thank it. There is a lesson in that for anyone building something meant to outlast them.</p>
<blockquote>We do not inherit the earth from our ancestors; we borrow it from our children.</blockquote>
<h2>Everything is connected</h2>
<p>Remove one species from an ecosystem and the effects ripple outward in ways no one predicted. Communities work the same way. When we neglect one part of society, the whole is diminished — quietly at first, and then all at once.</p>
<p>The natural world does not ask us to be sentimental about it. It asks us to be accurate about our place within it.</p>`,
  },
  {
    title: 'The Journey Within Shapes Everything',
    category: 'Life',
    excerpt:
      'Before we can change anything around us, we have to be honest about what is happening inside us.',
    content: `<p>Every outward journey begins as an inward one. The decisions that shaped my life were rarely made in a moment of clarity; they were made slowly, in the quiet accumulation of small honest choices.</p>
<h2>The questions worth asking</h2>
<p>What am I building? Who does it serve? What would remain if the title, the position and the applause were taken away?</p>
<p>These are uncomfortable questions, and that discomfort is precisely the point. A life examined is a life that can be corrected.</p>
<h2>Stillness as a discipline</h2>
<p>We have made busyness a badge of honour. But the most consequential thinking I have done has happened in stillness — walking, watching, waiting. Not doing nothing, but doing the one thing that cannot be delegated.</p>
<p>The journey within is not an escape from the world. It is the preparation for it.</p>`,
  },
  {
    title: 'Leadership Is Service, Not Position',
    category: 'Leadership',
    excerpt:
      'The most enduring leaders I have known measured themselves by what grew after they left the room.',
    content: `<p>Somewhere along the way we confused leadership with authority. Authority is granted. Leadership is earned, and re-earned, in the way we treat people when nothing is required of us.</p>
<h2>The test of a leader</h2>
<p>Not what they achieved while in the room, but what continued after they left it. Not how many followed them, but how many they made unnecessary to lead.</p>
<h2>Three things I try to hold on to</h2>
<ul>
<li><strong>Listen longer than is comfortable.</strong> The most valuable information usually arrives after the pause.</li>
<li><strong>Give credit away.</strong> It multiplies rather than divides.</li>
<li><strong>Protect the people who cannot protect themselves.</strong> That is the whole job, really.</li>
</ul>
<p>A position is temporary. The habit of service is not.</p>`,
  },
  {
    title: 'The World We Choose to Build',
    category: 'Humanity',
    excerpt:
      'On opportunity, responsibility and the future we choose to create for generations to come.',
    content: `<p>Every generation inherits a world it did not design and hands on a world it did. What happens in between is the only part we control, and it is decided far less by grand declarations than by ordinary choices repeated at scale.</p>
<h2>Opportunity is the whole argument</h2>
<p>Talent is distributed evenly across the world; opportunity is not. Almost every problem I have worked on traces back to that single imbalance — and almost every solution begins by correcting it in one small, specific place.</p>
<h2>Responsibility does not scale down</h2>
<p>It is tempting to believe that responsibility belongs to institutions, to governments, to someone with a larger platform. But responsibility does not scale down neatly. It arrives, in full, at the desk of whoever is willing to pick it up.</p>
<blockquote>The world we choose to build is simply the sum of what we were unwilling to walk past.</blockquote>
<p>I remain an optimist, not because the evidence is overwhelming, but because pessimism has never built anything.</p>`,
  },
];

const PAGES = [
  {
    key: 'about-me',
    eyebrow: 'About Azharuddin',
    title: 'A life of purpose. A legacy of impact.',
    intro:
      'Humanitarian by heart. Driven by purpose. A lifelong student of people, places and the natural world.',
    body: `<p>I have spent my life at the meeting point of two convictions: that people deserve opportunity, and that the natural world deserves protection. Neither is negotiable, and neither works without the other.</p>
<p>Much of my work has been about building opportunity — for communities, for young people finding their footing, and for those whose talent has never been matched by access. The rest has been about stewardship: leaving the places I have been better than I found them.</p>
<p>This site is where I write it all down. Not as instruction, but as reflection — the thinking of someone still very much in the middle of the work.</p>`,
    sections: [
      {
        heading: 'Humanity first',
        meta: 'What guides me',
        body: '<p>Every decision, at some point, comes down to a person. Policies, plans and strategies matter, but only insofar as they change what a real human being experiences on an ordinary day.</p>',
      },
      {
        heading: 'A responsibility to nature',
        meta: 'What I protect',
        body: '<p>The natural world has been my teacher and my refuge. Protecting it is not charity — it is the most basic form of self-interest we have, and the most honest inheritance we can leave.</p>',
      },
      {
        heading: 'Building what outlasts you',
        meta: 'What I am working towards',
        body: '<p>The measure of any effort is what survives without you. I try to build things that do not need me — communities that carry themselves, and people who no longer need permission.</p>',
      },
    ],
  },
  {
    key: 'my-views',
    eyebrow: 'My Views',
    title: 'What I believe, and why',
    intro:
      'A set of convictions shaped by people, places and the responsibility we all carry for one another.',
    body: `<p>These are not positions I hold lightly, nor ones I expect everyone to share. They are simply the conclusions I have arrived at, and I remain open to being persuaded otherwise.</p>`,
    sections: [
      {
        heading: 'Opportunity should not depend on where you were born',
        body: '<p>Talent is distributed evenly across the world. Opportunity is not. Almost every problem worth solving traces back to that single imbalance.</p>',
      },
      {
        heading: 'Nature is not a resource, it is a relationship',
        body: '<p>We speak of the environment as something to be managed. It would serve us better to speak of it as something we belong to.</p>',
      },
      {
        heading: 'Leadership is a form of service',
        body: '<p>Position without service is simply administration. The leaders worth following are the ones who make themselves unnecessary.</p>',
      },
      {
        heading: 'Kindness is a strategy, not a sentiment',
        body: '<p>It is the most under-used and most compounding investment available to any community or organisation.</p>',
      },
    ],
  },
  {
    key: 'media',
    eyebrow: 'Media',
    title: 'Features, talks and appearances',
    intro: 'Selected coverage, conversations and public appearances.',
    body: '',
    sections: [
      {
        heading: 'On building communities that outlast us',
        meta: 'Conversation · 2026',
        body: '<p>A long-form conversation on opportunity, stewardship and the responsibility of those who have been given a platform.</p>',
      },
      {
        heading: 'Nature, leadership and the long view',
        meta: 'Keynote · 2025',
        body: '<p>A talk on what the natural world teaches us about patience, systems and consequence.</p>',
      },
    ],
  },
  {
    key: 'contact',
    eyebrow: 'Contact',
    title: 'Let us start a conversation',
    intro:
      'For speaking invitations, collaborations, or a simple hello — the door is open.',
    body: '<p>I read everything that comes through, and reply to as much as I am able. If your message concerns a collaboration or a speaking engagement, a few lines of context will help enormously.</p>',
    sections: [],
  },
  {
    key: 'journal',
    eyebrow: 'The Journal',
    title: 'Thoughts, written down',
    intro:
      'Reflections on life, leadership, nature and the responsibility we share for a kinder tomorrow.',
    body: '',
    sections: [],
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to ${MONGODB_URI}\n`);

  /* ---- Admin user ---- */
  const existingUser = await User.findOne({ username: ADMIN_USERNAME });
  if (existingUser) {
    console.log(`• Admin user "${ADMIN_USERNAME}" already exists — left untouched.`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({ username: ADMIN_USERNAME, passwordHash, name: 'Administrator' });
    console.log(`✓ Admin user created — username: ${ADMIN_USERNAME} / password: ${ADMIN_PASSWORD}`);
  }

  /* ---- Categories ---- */
  const categoryIds = {};
  for (const name of CATEGORIES) {
    const slug = slugify(name);
    let category = await Category.findOne({ slug });
    if (!category) {
      category = await Category.create({ name, slug, description: '' });
      console.log(`✓ Category created: ${name}`);
    }
    categoryIds[name] = category._id;
  }

  /* ---- Articles ---- */
  const now = Date.now();
  let index = 0;
  for (const entry of ARTICLES) {
    const slug = slugify(entry.title);
    const existing = await Article.findOne({ slug });
    if (existing) {
      console.log(`• Article already exists: ${entry.title}`);
      index += 1;
      continue;
    }
    const words = entry.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    await Article.create({
      title: entry.title,
      slug,
      category: categoryIds[entry.category],
      excerpt: entry.excerpt,
      content: entry.content,
      image: '',
      imageAlt: entry.title,
      status: 'published',
      publishedAt: new Date(now - index * 86400000),
      readingMinutes: Math.max(1, Math.round(words / 200)),
      seoTitle: '',
      seoDescription: entry.excerpt,
    });
    console.log(`✓ Article created: ${entry.title}`);
    index += 1;
  }

  /* ---- Pages ---- */
  for (const page of PAGES) {
    const existing = await Page.findOne({ key: page.key });
    if (existing) {
      console.log(`• Page already exists: ${page.key}`);
      continue;
    }
    await Page.create({ ...page, image: '', seoTitle: '', seoDescription: page.intro });
    console.log(`✓ Page created: ${page.key}`);
  }

  /* ---- Settings ---- */
  let settings = await Settings.findOne({ singleton: 'site' });
  if (!settings) {
    const featured = await Article.findOne({ slug: slugify(ARTICLES[0].title) });
    settings = await Settings.create({
      singleton: 'site',
      siteName: 'AZHARUDDIN',
      siteTagline: 'Humanitarian. Nature Lover.',
      siteDescription:
        'Personal reflections on life, leadership, humanity and our responsibility towards creating a better world.',
      heroEyebrow: 'HUMANITARIAN. NATURE LOVER.',
      heroHeading: 'AZHARUDDIN',
      heroText:
        'Sharing thoughts on life, leadership, humanity and our responsibility towards creating a better world.',
      heroCtaLabel: 'EXPLORE MY VIEWS',
      heroCtaHref: '/my-views',
      heroRailText: 'PURPOSE • PEOPLE • PLANET',
      featuredArticle: featured?._id ?? null,
      philosophyQuote:
        'I believe in touching lives, protecting nature and leaving this world a little better.',
      aboutEyebrow: 'ABOUT AZHARUDDIN',
      aboutHeading: 'A life of purpose.\nA legacy of impact.',
      aboutText:
        'I am committed to building opportunities, empowering communities and creating a sustainable tomorrow. Humanitarian by heart. Driven by purpose.',
      aboutCtaLabel: 'READ MORE ABOUT ME',
      footerText: 'Thoughts for a kinder, brighter tomorrow.',
      footerCopyright: 'All Rights Reserved.',
      linkedinUrl: '',
      instagramUrl: '',
      emailAddress: '',
    });
    console.log('✓ Site settings created');
  } else {
    console.log('• Site settings already exist — left untouched.');
  }

  console.log('\nSeed complete.');
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('\nSeed failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
