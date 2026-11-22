import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (user.role !== 'vendor') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const myServices = store.services.filter(
      (s) => s.vendorId?._id === user._id || s.vendorId?.id === user.id
    );

    return NextResponse.json({ success: true, services: myServices });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
