import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthRequest, generateToken, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, UserModel, serializeDoc, mongoJson } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

    if (user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only vendors can manage subscription plans.' },
        { status: 403 }
      );
    }

    if (isMongoConfigured()) {
      await connectMongo();
      const updated = await UserModel.findByIdAndUpdate(
        user._id,
        { subscriptionPlan: 'free', subscriptionExpiresAt: null },
        { new: true }
      ).select('-password');
      const safeUser = serializeDoc(updated);
      const freshToken = generateToken(safeUser);
      return mongoJson({
        success: true,
        message: 'Subscription switched back to Free Plan.',
        user: safeUser,
        token: freshToken,
      });
    }

    user.subscriptionPlan = 'free';
    user.subscriptionExpiresAt = null;

    const freshToken = generateToken(user);
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: 'Subscription switched back to Free Plan.',
      user: safeUser,
      token: freshToken,
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
