import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader, handleApiError } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const totalUsers = store.users.length;
    const totalVendors = store.users.filter((u) => u.role === 'vendor').length;
    const totalCustomers = store.users.filter((u) => u.role === 'customer').length;
    const totalServices = store.services.length;
    const pendingServices = store.services.filter((s) => s.status === 'pending').length;
    const totalTransactions = store.transactions.length;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalVendors,
        totalCustomers,
        totalServices,
        pendingServices,
        totalTransactions,
      },
      recentTransactions: store.transactions.slice(0, 5),
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
