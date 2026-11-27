import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import {
  isMongoConfigured,
  connectMongo,
  UserModel,
  ServiceModel,
  TransactionModel,
  serializeDoc,
  mongoJson,
} from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    if (isMongoConfigured()) {
      await connectMongo();
      const [
        totalUsers,
        totalVendors,
        totalCustomers,
        totalServices,
        pendingServices,
        totalTransactions,
        recentTxDocs,
      ] = await Promise.all([
        UserModel.countDocuments(),
        UserModel.countDocuments({ role: 'vendor' }),
        UserModel.countDocuments({ role: 'customer' }),
        ServiceModel.countDocuments(),
        ServiceModel.countDocuments({ status: 'pending' }),
        TransactionModel.countDocuments(),
        TransactionModel.find()
          .populate('vendorId', 'name email businessName image')
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

      return mongoJson({
        success: true,
        stats: {
          totalUsers,
          totalVendors,
          totalCustomers,
          totalServices,
          pendingServices,
          totalTransactions,
        },
        recentTransactions: recentTxDocs.map(serializeDoc),
      });
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
