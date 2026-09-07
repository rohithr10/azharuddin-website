import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { saveUpload } from '@/lib/upload';
import { IMAGE_SPECS, type ImagePurpose } from '@/lib/image-specs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const rawPurpose = String(formData.get('purpose') ?? 'general');
    const purpose = (rawPurpose in IMAGE_SPECS ? rawPurpose : 'general') as ImagePurpose;
    const alt = String(formData.get('alt') ?? '').slice(0, 200);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No image was received.' }, { status: 400 });
    }

    const saved = await saveUpload(file, purpose, alt);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The upload failed.';
    console.error('Upload failed:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
