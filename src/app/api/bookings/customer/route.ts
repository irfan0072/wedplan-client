import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    const userBookings = store.bookings.filter(
      (b) => b.customerId?._id === user._id || b.customerId?.id === user.id
    );

    return NextResponse.json({ success: true, bookings: userBookings });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
