import ConfirmSubmit from '@/components/admin/ConfirmSubmit';
import { dbConnect } from '@/lib/db';
import { Message } from '@/lib/models';
import { deleteMessageAction, markMessageReadAction } from '@/app/admin/actions';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  await dbConnect();
  const messages = await Message.find().sort({ createdAt: -1 }).limit(200).lean();

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1 className="a-title">Messages</h1>
          <p className="a-subtitle">Everything sent through the contact form on the website.</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <p className="a-empty">No messages yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {messages.map((message: any) => (
            <div
              key={String(message._id)}
              className="a-panel"
              style={{ borderLeft: message.read ? undefined : '3px solid var(--a-gold)' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  alignItems: 'baseline',
                }}
              >
                <div>
                  <strong>{message.name}</strong>{' '}
                  <a href={`mailto:${message.email}`} style={{ color: 'var(--a-gold)' }}>
                    {message.email}
                  </a>
                  {message.subject && (
                    <div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>{message.subject}</div>
                  )}
                </div>
                <span style={{ color: 'var(--a-muted)', fontSize: '0.8rem' }}>
                  {formatDate(message.createdAt)}
                  {!message.read && ' · new'}
                </span>
              </div>

              <p style={{ marginTop: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>
                {message.message}
              </p>

              <div className="a-actions" style={{ marginTop: '1.1rem' }}>
                <a href={`mailto:${message.email}`} className="a-btn a-btn--secondary">
                  Reply by email
                </a>
                <form action={markMessageReadAction}>
                  <input type="hidden" name="id" value={String(message._id)} />
                  <input type="hidden" name="read" value={message.read ? 'false' : 'true'} />
                  <button type="submit" className="a-btn a-btn--ghost">
                    Mark as {message.read ? 'unread' : 'read'}
                  </button>
                </form>
                <form action={deleteMessageAction} style={{ marginLeft: 'auto' }}>
                  <input type="hidden" name="id" value={String(message._id)} />
                  <ConfirmSubmit message="Delete this message permanently?">Delete</ConfirmSubmit>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
