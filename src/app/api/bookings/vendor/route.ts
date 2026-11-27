import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, BookingModel, serializeDoc, mongoJson } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

    if (user.role !== 'vendor') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    if (isMongoConfigured()) {
      await connectMongo();
      const docs = await BookingModel.find({ vendorId: user._id })
        .populate('serviceId', 'serviceName images price category location')
        .populate('customerId', 'name email phone image')
        .sort({ createdAt: -1 });
      return mongoJson({ success: true, bookings: docs.map(serializeDoc) });
    }

    const vendorBookings = store.bookings.filter(
      (b) => b.vendorId?._id === user._id || b.vendorId?.id === user.id
    );

    return NextResponse.json({ success: true, bookings: vendorBookings });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
