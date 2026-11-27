import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, ServiceModel, serializeDoc, mongoJson } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    if (isMongoConfigured()) {
      await connectMongo();
      const query: any = {};
      if (search) {
        const rx = new RegExp(search, 'i');
        query.$or = [{ serviceName: rx }, { location: rx }];
      }
      if (category && category !== 'all') {
        query.category = category;
      }
      if (status && status !== 'all') {
        query.status = status;
      }

      const docs = await ServiceModel.find(query)
        .populate('vendorId', 'name businessName email image subscriptionPlan')
        .sort({ createdAt: -1 });
      const services = docs.map(serializeDoc);
      return mongoJson({ success: true, services, total: services.length });
    }

    const searchLower = search.toLowerCase();
    let list = [...store.services];

    if (searchLower) {
      list = list.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(searchLower) ||
          s.location.toLowerCase().includes(searchLower)
      );
    }

    if (category && category !== 'all') {
      list = list.filter((s) => s.category === category);
    }

    if (status && status !== 'all') {
      list = list.filter((s) => s.status === status);
    }

    return NextResponse.json({ success: true, services: list, total: list.length });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
