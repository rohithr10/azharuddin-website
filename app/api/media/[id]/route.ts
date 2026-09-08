import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Media } from '@/lib/models';

export const runtime = 'nodejs';

/**
 * Serves an uploaded image out of the database.
 *
 * Every stored image has a content-addressed, immutable URL — replacing an
 * image creates a new record — so responses can be cached indefinitely.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const objectId = id.replace(/\.[a-z0-9]+$/i, '');

  if (!/^[a-f0-9]{24}$/i.test(objectId)) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    await dbConnect();
    const media = await Media.findById(objectId).select('+data mimeType').lean();
    const raw = (media as any)?.data;

    if (!media || !raw) {
      return new NextResponse('Not found', { status: 404 });
    }

    // A lean() read returns BSON Binary rather than a Node Buffer, and its
    // `length` is a method — normalise before reading the byte count.
    const bytes: Buffer = Buffer.isBuffer(raw)
      ? raw
      : Buffer.from(raw.buffer ?? raw.value?.() ?? raw);

    const contentType = (media as any).mimeType || 'image/webp';

    // Buffer is backed by ArrayBufferLike, which is not accepted as a response
    // body; Uint8Array.from gives a plain ArrayBuffer-backed view.
    const body = Uint8Array.from(bytes);

    return new NextResponse(body, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=31536000, immutable',
        'content-length': String(bytes.byteLength),
      },
    });
  } catch (error) {
    console.error('Could not serve media:', error);
    return new NextResponse('Not found', { status: 404 });
  }
}
