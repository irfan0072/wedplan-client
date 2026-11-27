import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, mongoJson } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);
    const { password: _, ...safeUser } = user;

    if (isMongoConfigured()) {
      return mongoJson({ success: true, user: safeUser });
    }

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
