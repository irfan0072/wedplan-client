import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, ServiceModel, serializeDoc, mongoJson } from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (isMongoConfigured()) {
    await connectMongo();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return mongoJson({ success: false, message: 'Service not found.' }, 404);
    }
    const doc = await ServiceModel.findById(params.id).populate(
      'vendorId',
      'name businessName image email phone bio subscriptionPlan'
    );
    if (!doc) {
      return mongoJson({ success: false, message: 'Service not found.' }, 404);
    }
    return mongoJson({ success: true, service: serializeDoc(doc) });
  }

  const service = store.services.find((s) => s._id === params.id || s.id === params.id);
  if (!service) {
    return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, service });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);
    const { serviceName, category, description, price, location, images } = await req.json();

    if (isMongoConfigured()) {
      await connectMongo();
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return mongoJson({ success: false, message: 'Service not found.' }, 404);
      }
      const doc = await ServiceModel.findById(params.id);
      if (!doc) {
        return mongoJson({ success: false, message: 'Service not found.' }, 404);
      }
      if (doc.vendorId.toString() !== user._id && user.role !== 'admin') {
        return mongoJson({ success: false, message: 'Forbidden.' }, 403);
      }
      if (serviceName) doc.serviceName = serviceName;
      if (category) doc.category = category;
      if (description) doc.description = description;
      if (price !== undefined) doc.price = Number(price);
      if (location) doc.location = location;
      if (images) doc.images = images;
      await doc.save();
      const populated = await doc.populate(
        'vendorId',
        'name businessName image email phone subscriptionPlan'
      );
      return mongoJson({ success: true, message: 'Service updated.', service: serializeDoc(populated) });
    }

    const service = store.services.find((s) => s._id === params.id || s.id === params.id);
    if (!service) {
      return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
    }

    if (service.vendorId?._id !== user._id && service.vendorId?.id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    if (serviceName) service.serviceName = serviceName;
    if (category) service.category = category;
    if (description) service.description = description;
    if (price !== undefined) service.price = Number(price);
    if (location) service.location = location;
    if (images) service.images = images;

    return NextResponse.json({ success: true, message: 'Service updated.', service });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
      if (doc.vendorId.toString() !== user._id && user.role !== 'admin') {
        return mongoJson({ success: false, message: 'Forbidden.' }, 403);
      }
      await ServiceModel.findByIdAndDelete(params.id);
      return mongoJson({ success: true, message: 'Service deleted.' });
    }

    const index = store.services.findIndex((s) => s._id === params.id || s.id === params.id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
    }

    const service = store.services[index];
    if (service.vendorId?._id !== user._id && service.vendorId?.id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    store.services.splice(index, 1);
    return NextResponse.json({ success: true, message: 'Service deleted.' });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
