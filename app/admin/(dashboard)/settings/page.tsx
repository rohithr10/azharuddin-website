import SettingsForm from '@/components/admin/SettingsForm';
import PasswordForm from '@/components/admin/PasswordForm';
import { getSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">Settings</h1>
          <p className="a-subtitle">
            Images, headings and links used across the website. Changes appear straight away.
          </p>
        </div>
      </div>

      <SettingsForm settings={settings} />

      <div className="a-panel" style={{ marginTop: '1.25rem' }}>
        <h2 className="a-panel-title">Your password</h2>
        <p className="a-panel-note">
          Change the password you use to sign in here. Do this as soon as the site goes live.
        </p>
        <PasswordForm />
      </div>
    </>
  );
}
