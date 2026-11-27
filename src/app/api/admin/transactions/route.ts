import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, TransactionModel, serializeDoc, mongoJson } from '@/lib/mongodb';

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
      const docs = await TransactionModel.find()
        .populate('vendorId', 'name email businessName image')
        .sort({ createdAt: -1 });
      const transactions = docs.map(serializeDoc);
      return mongoJson({
        success: true,
        transactions,
        total: transactions.length,
      });
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
