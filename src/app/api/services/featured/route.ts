import { NextResponse } from 'next/server';
import { store } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, ServiceModel, serializeDoc, mongoJson } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isMongoConfigured()) {
    await connectMongo();
    const docs = await ServiceModel.find({ status: 'approved', isActive: true })
      .populate('vendorId', 'name businessName image email phone subscriptionPlan')
      .sort({ createdAt: -1 })
      .limit(6);

    return mongoJson({
      success: true,
      services: docs.map(serializeDoc),
    });
  }

  const featured = store.services
    .filter((s) => s.status === 'approved' && s.isActive)
    .slice(0, 6);

  return NextResponse.json({
    success: true,
    services: featured,
  });
}
