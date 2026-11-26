import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader, handleApiError } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let list = [...store.services];

    if (search) {
      list = list.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(search) ||
          s.location.toLowerCase().includes(search)
      );
    }

    if (category && category !== 'all') {
      list = list.filter((s) => s.category === category);
    }

    if (status && status !== 'all') {
      list = list.filter((s) => s.status === status);
    }

    return NextResponse.json({ success: true, services: list, total: list.length });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
