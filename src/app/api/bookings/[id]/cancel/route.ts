import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, BookingModel, serializeDoc, mongoJson } from '@/lib/mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

    if (isMongoConfigured()) {
      await connectMongo();
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return mongoJson({ success: false, message: 'Booking not found.' }, 404);
      }
      const doc = await BookingModel.findById(params.id);
      if (!doc) {
        return mongoJson({ success: false, message: 'Booking not found.' }, 404);
      }
      if (doc.customerId.toString() !== user._id) {
        return mongoJson({ success: false, message: 'Forbidden.' }, 403);
      }
      if (doc.status !== 'pending') {
        return mongoJson({ success: false, message: 'Only pending bookings can be cancelled.' }, 400);
      }
      doc.status = 'cancelled';
      await doc.save();
      const populated = await doc.populate([
        { path: 'serviceId', select: 'serviceName images price category location' },
        { path: 'vendorId', select: 'name businessName email phone image' },
      ]);
      return mongoJson({ success: true, message: 'Booking cancelled.', booking: serializeDoc(populated) });
    }

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
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
