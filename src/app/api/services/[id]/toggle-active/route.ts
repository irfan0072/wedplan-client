import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, ServiceModel, mongoJson } from '@/lib/mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

    if (isMongoConfigured()) {
      await connectMongo();
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return mongoJson({ success: false, message: 'Service not found.' }, 404);
      }
      const doc = await ServiceModel.findById(params.id);
      if (!doc) {
        return mongoJson({ success: false, message: 'Service not found.' }, 404);
      }
      if (doc.vendorId.toString() !== user._id) {
        return mongoJson({ success: false, message: 'Forbidden.' }, 403);
      }
      if (!doc.isActive && user.subscriptionPlan !== 'premium') {
        const activeCount = await ServiceModel.countDocuments({
          vendorId: user._id,
          isActive: true,
        });
        if (activeCount >= 3) {
          return mongoJson(
            {
              success: false,
              message: 'Free tier limit: maximum 3 active services. Upgrade to Premium to activate more.',
            },
            403
          );
        }
      }
      doc.isActive = !doc.isActive;
      await doc.save();
      return mongoJson({
        success: true,
        message: `Service is now ${doc.isActive ? 'Active' : 'Inactive'}.`,
        isActive: doc.isActive,
      });
    }

    const service = store.services.find((s) => s._id === params.id || s.id === params.id);
    if (!service) {
      return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
    }

    if (service.vendorId?._id !== user._id && service.vendorId?.id !== user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    if (!service.isActive && user.subscriptionPlan !== 'premium') {
      const activeCount = store.services.filter(
        (s) => (s.vendorId?._id === user._id || s.vendorId?.id === user.id) && s.isActive
      ).length;

      if (activeCount >= 3) {
        return NextResponse.json(
          {
            success: false,
            message: 'Free tier limit: maximum 3 active services. Upgrade to Premium to activate more.',
          },
          { status: 403 }
        );
      }
    }

    service.isActive = !service.isActive;
    return NextResponse.json({
      success: true,
      message: `Service is now ${service.isActive ? 'Active' : 'Inactive'}.`,
      isActive: service.isActive,
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
