import { cookies } from 'next/headers';
import { requirePermission } from '@/lib/auth/assertPermission';
import { forwardVideoUpload } from '@/lib/upload/videoUpload.server';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * POST /api/upload/video — upload video SKU (tránh giới hạn body Server Action).
 * Field: file
 */
export async function POST(request) {
  const denied = await requirePermission('update:any', 'product');
  if (denied) {
    return Response.json(denied, { status: 403 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const clientId = cookieStore.get('admin_client_id')?.value;

  if (!token || !clientId) {
    return Response.json(
      { error: 'Chưa đăng nhập. Vui lòng đăng nhập lại.' },
      { status: 401 },
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return Response.json(
      {
        error: err.message?.includes('Unexpected end of form')
          ? 'Upload bị gián đoạn hoặc file quá lớn. Thử lại hoặc chọn video nhỏ hơn 50MB.'
          : (err.message ?? 'Không đọc được file upload'),
      },
      { status: 400 },
    );
  }

  const file = formData.get('file');
  const result = await forwardVideoUpload({ file, token, clientId });

  if (result.error) {
    const status = result.error.includes('đăng nhập') ? 401 : 400;
    return Response.json({ error: result.error }, { status });
  }

  return Response.json(result);
}
