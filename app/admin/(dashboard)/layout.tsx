import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Message } from '@/lib/models';
import '../admin.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Content Manager',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  let unread = 0;
  try {
    await dbConnect();
    unread = await Message.countDocuments({ read: false });
  } catch {
    unread = 0;
  }

  return (
    <div className="a-body">
      <AdminShell username={session.username} unreadCount={unread}>
        {children}
      </AdminShell>
    </div>
  );
}
