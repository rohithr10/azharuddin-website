import type { Metadata } from 'next';
import PageIntro from '@/components/site/PageIntro';
import ContactForm from '@/components/site/ContactForm';
import Reveal from '@/components/ui/Reveal';
import { InstagramIcon, LinkedInIcon, MailIcon } from '@/components/ui/icons';
import { getPage, getSettings } from '@/lib/data';
import { mailtoUrl, safeUrl } from '@/lib/utils';
import styles from './contact.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('contact');
  return {
    title: page?.seoTitle || page?.title || 'Contact',
    description: page?.seoDescription || page?.intro,
    alternates: { canonical: '/contact' },
  };
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPage('contact'), getSettings()]);

  const linkedin = safeUrl(settings.linkedinUrl);
  const instagram = safeUrl(settings.instagramUrl);
  const email = mailtoUrl(settings.emailAddress);

  return (
    <>
      <PageIntro
        eyebrow={page?.eyebrow || 'Contact'}
        title={page?.title || 'Let us start a conversation'}
        intro={
          page?.intro ||
          'For speaking invitations, collaborations or a simple hello — the door is open.'
        }
        image={page?.image}
      />

      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            <Reveal className={styles.details}>
              {page?.body ? (
                <div className="prose" dangerouslySetInnerHTML={{ __html: page.body }} />
              ) : null}

              <ul className={styles.channels}>
                {email && (
                  <li>
                    <a href={email} className={styles.channel}>
                      <span className={styles.channelIcon}>
                        <MailIcon size={17} />
                      </span>
                      <span>
                        <span className={styles.channelLabel}>Email</span>
                        <span className={styles.channelValue}>{settings.emailAddress}</span>
                      </span>
                    </a>
                  </li>
                )}
                {linkedin && (
                  <li>
                    <a
                      href={linkedin}
                      className={styles.channel}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className={styles.channelIcon}>
                        <LinkedInIcon size={17} />
                      </span>
                      <span>
                        <span className={styles.channelLabel}>LinkedIn</span>
                        <span className={styles.channelValue}>Connect professionally</span>
                      </span>
                    </a>
                  </li>
                )}
                {instagram && (
                  <li>
                    <a
                      href={instagram}
                      className={styles.channel}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className={styles.channelIcon}>
                        <InstagramIcon size={17} />
                      </span>
                      <span>
                        <span className={styles.channelLabel}>Instagram</span>
                        <span className={styles.channelValue}>Moments and reflections</span>
                      </span>
                    </a>
                  </li>
                )}
              </ul>
            </Reveal>

            <Reveal className={styles.formWrap} delay={80}>
              <h2 className={styles.formTitle}>Send a message</h2>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
