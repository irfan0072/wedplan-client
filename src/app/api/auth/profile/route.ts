import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, UserModel, serializeDoc, mongoJson } from '@/lib/mongodb';

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);
    const { name, image, phone, bio, businessName } = await req.json();

    if (isMongoConfigured()) {
      await connectMongo();
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (image !== undefined) updates.image = image;
      if (phone !== undefined) updates.phone = phone;
      if (bio !== undefined) updates.bio = bio;
      if (businessName !== undefined && user.role === 'vendor') updates.businessName = businessName;

      const updated = await UserModel.findByIdAndUpdate(user._id, updates, { new: true }).select('-password');
      return mongoJson({
        success: true,
        message: 'Profile updated successfully!',
        user: serializeDoc(updated),
      });
    }

    if (name !== undefined) user.name = name;
    if (image !== undefined) user.image = image;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (businessName !== undefined && user.role === 'vendor') user.businessName = businessName;

    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: safeUser,
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
