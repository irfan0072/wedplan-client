import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const service = store.services.find((s) => s._id === params.id || s.id === params.id);
    if (!service) {
      return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
    }

    const { status, isActive } = await req.json();
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      service.status = status;
    }
    if (isActive !== undefined) {
      service.isActive = Boolean(isActive);
    }

    return NextResponse.json({
      success: true,
      message: `Service status updated to ${service.status}.`,
      service,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
