import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, ServiceModel, serializeDoc, mongoJson } from '@/lib/mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const { status, isActive } = await req.json();

    if (isMongoConfigured()) {
      await connectMongo();
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return mongoJson({ success: false, message: 'Service not found.' }, 404);
      }
      const doc = await ServiceModel.findById(params.id);
      if (!doc) {
        return mongoJson({ success: false, message: 'Service not found.' }, 404);
      }
      if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        doc.status = status;
      }
      if (isActive !== undefined) {
        doc.isActive = Boolean(isActive);
      }
      await doc.save();
      const populated = await doc.populate(
        'vendorId',
        'name businessName email image subscriptionPlan'
      );
      return mongoJson({
        success: true,
        message: `Service status updated to ${doc.status}.`,
        service: serializeDoc(populated),
      });
    }

    const service = store.services.find((s) => s._id === params.id || s.id === params.id);
    if (!service) {
      return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
    }

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      service.status = status;
    }
    if (isActive !== undefined) {
      service.isActive = Boolean(isActive);
    }

    return NextResponse.json({
      success: true,
      message: `Service status updated to ${service.status}.`,
      service,
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
