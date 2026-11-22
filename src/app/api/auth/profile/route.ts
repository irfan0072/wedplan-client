import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    const { name, image, phone, bio, businessName } = await req.json();

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
    return NextResponse.json(
      { success: false, message: err.message || 'Profile update error.' },
      { status: 400 }
    );
  }
}
