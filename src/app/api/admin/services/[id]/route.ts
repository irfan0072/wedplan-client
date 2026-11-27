import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, ServiceModel, mongoJson } from '@/lib/mongodb';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only administrators can delete services here.' },
        { status: 403 }
      );
    }

    if (isMongoConfigured()) {
      await connectMongo();
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return mongoJson({ success: false, message: 'Service not found.' }, 404);
      }
      const deleted = await ServiceModel.findByIdAndDelete(params.id);
      if (!deleted) {
        return mongoJson({ success: false, message: 'Service not found.' }, 404);
      }
      return mongoJson({ success: true, message: 'Service deleted permanently by admin.' });
    }

    const index = store.services.findIndex(
      (s) => s._id === params.id || s.id === params.id
    );

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: 'Service not found.' },
        { status: 404 }
      );
    }

    store.services.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Service deleted permanently by admin.',
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
