import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthHeader } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Unauthorized.' },
      { status: 401 }
    );
  }
}
