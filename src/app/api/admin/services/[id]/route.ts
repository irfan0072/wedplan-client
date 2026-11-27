import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader, handleApiError } from '@/lib/server-store';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only administrators can delete services here.' },
        { status: 403 }
      );
    }

    const index = store.services.findIndex(
      (s) => s._id === params.id || s.id === params.id
    );

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: 'Service not found.' },
        { status: 404 }
      );
    }

    store.services.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Service deleted permanently by admin.',
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
