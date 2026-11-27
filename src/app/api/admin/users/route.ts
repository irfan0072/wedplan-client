import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, UserModel, serializeDoc, mongoJson } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const role = searchParams.get('role');

    if (isMongoConfigured()) {
      await connectMongo();
      const query: any = {};
      if (search) {
        const rx = new RegExp(search, 'i');
        query.$or = [{ name: rx }, { email: rx }, { businessName: rx }];
      }
      if (role && role !== 'all') {
        query.role = role;
      }

      const docs = await UserModel.find(query).select('-password').sort({ createdAt: -1 });
      const users = docs.map(serializeDoc);
      return mongoJson({ success: true, users, total: users.length });
    }

    const searchLower = search.toLowerCase();
    let list = store.users.map(({ password: _, ...safeUser }) => safeUser);

    if (searchLower) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          (u.businessName && u.businessName.toLowerCase().includes(searchLower))
      );
    }

    if (role && role !== 'all') {
      list = list.filter((u) => u.role === role);
    }

    return NextResponse.json({ success: true, users: list, total: list.length });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
