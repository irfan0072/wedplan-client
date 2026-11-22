import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const service = store.services.find((s) => s._id === params.id || s.id === params.id);
  if (!service) {
    return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, service });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    const service = store.services.find((s) => s._id === params.id || s.id === params.id);
    if (!service) {
      return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
    }

    if (service.vendorId?._id !== user._id && service.vendorId?.id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const { serviceName, category, description, price, location, images } = await req.json();
    if (serviceName) service.serviceName = serviceName;
    if (category) service.category = category;
    if (description) service.description = description;
    if (price !== undefined) service.price = Number(price);
    if (location) service.location = location;
    if (images) service.images = images;

    return NextResponse.json({ success: true, message: 'Service updated.', service });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

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
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
