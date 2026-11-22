import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    const booking = store.bookings.find((b) => b._id === params.id || b.id === params.id);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
    }

    if (booking.customerId?._id !== user._id && booking.customerId?.id !== user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: `Only pending bookings can be cancelled.` },
        { status: 400 }
      );
    }

    booking.status = 'cancelled';
    return NextResponse.json({ success: true, message: 'Booking cancelled.', booking });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
