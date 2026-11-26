import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader, handleApiError } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      transactions: store.transactions,
      total: store.transactions.length,
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
