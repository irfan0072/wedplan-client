import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const admin = verifyAuthHeader(authHeader);

    if (admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    if (admin._id === params.id || admin.id === params.id) {
      return NextResponse.json({ success: false, message: 'Cannot block own account.' }, { status: 400 });
    }

    const targetUser = store.users.find((u) => u._id === params.id || u.id === params.id);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    targetUser.isBlocked = !targetUser.isBlocked;
    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} is now ${targetUser.isBlocked ? 'blocked' : 'unblocked'}.`,
      isBlocked: targetUser.isBlocked,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
