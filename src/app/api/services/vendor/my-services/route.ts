import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, ServiceModel, serializeDoc, mongoJson } from '@/lib/mongodb';

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
      const docs = await ServiceModel.find({ vendorId: user._id })
        .populate('vendorId', 'name businessName image email phone subscriptionPlan')
        .sort({ createdAt: -1 });
      return mongoJson({ success: true, services: docs.map(serializeDoc) });
    }

    const myServices = store.services.filter(
      (s) => s.vendorId?._id === user._id || s.vendorId?.id === user.id
    );

    return NextResponse.json({ success: true, services: myServices });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
