import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { getSettings } from '@/lib/data';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader settings={settings} />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
