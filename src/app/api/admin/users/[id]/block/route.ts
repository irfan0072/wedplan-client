import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, UserModel, mongoJson } from '@/lib/mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const admin = await verifyAuthRequest(authHeader);

    if (admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    if (admin._id === params.id || admin.id === params.id) {
      return NextResponse.json({ success: false, message: 'Cannot block own account.' }, { status: 400 });
    }

    if (isMongoConfigured()) {
      await connectMongo();
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return mongoJson({ success: false, message: 'User not found.' }, 404);
      }
      const targetDoc = await UserModel.findById(params.id);
      if (!targetDoc) {
        return mongoJson({ success: false, message: 'User not found.' }, 404);
      }
      targetDoc.isBlocked = !targetDoc.isBlocked;
      await targetDoc.save();
      return mongoJson({
        success: true,
        message: `User ${targetDoc.name} is now ${targetDoc.isBlocked ? 'blocked' : 'unblocked'}.`,
        isBlocked: targetDoc.isBlocked,
      });
    }

    const targetUser = store.users.find((u) => u._id === params.id || u.id === params.id);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    targetUser.isBlocked = !targetUser.isBlocked;
    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} is now ${targetUser.isBlocked ? 'blocked' : 'unblocked'}.`,
      isBlocked: targetUser.isBlocked,
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
