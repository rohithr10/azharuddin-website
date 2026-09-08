import Link from 'next/link';
import StatusForm from '@/components/admin/StatusForm';
import { getSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  const settings = await getSettings();

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">Status</h1>
          <p className="a-subtitle">
            The banner image at the top of the homepage and the status wording shown over it.
          </p>
        </div>
        <Link href="/" target="_blank" rel="noopener noreferrer" className="a-btn a-btn--secondary">
          View homepage ↗
        </Link>
      </div>

      <StatusForm settings={settings} />
    </>
  );
}
