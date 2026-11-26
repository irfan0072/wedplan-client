import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader, handleApiError } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    const userBookings = store.bookings.filter(
      (b) => b.customerId?._id === user._id || b.customerId?.id === user.id
    );

    return NextResponse.json({ success: true, bookings: userBookings });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
