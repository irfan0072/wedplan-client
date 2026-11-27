import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, BookingModel, serializeDoc, mongoJson } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

    if (isMongoConfigured()) {
      await connectMongo();
      const docs = await BookingModel.find({ customerId: user._id })
        .populate('serviceId', 'serviceName images price category location')
        .populate('vendorId', 'name businessName email phone image')
        .sort({ createdAt: -1 });
      return mongoJson({ success: true, bookings: docs.map(serializeDoc) });
    }

    const userBookings = store.bookings.filter(
      (b) => b.customerId?._id === user._id || b.customerId?.id === user.id
    );

    return NextResponse.json({ success: true, bookings: userBookings });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
