import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (user.role !== 'vendor') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const vendorBookings = store.bookings.filter(
      (b) => b.vendorId?._id === user._id || b.vendorId?.id === user.id
    );

    return NextResponse.json({ success: true, bookings: vendorBookings });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
