import { NextRequest, NextResponse } from 'next/server';
import { store, generateToken } from '@/lib/server-store';

export async function POST(req: NextRequest) {
  try {
    const { email, name, image, role = 'customer' } = await req.json();

    let user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const assignedRole = role === 'vendor' ? 'vendor' : 'customer';
      user = {
        _id: `usr_${Date.now()}`,
        id: `usr_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        image,
        role: assignedRole,
        businessName: assignedRole === 'vendor' ? `${name}'s Wedding Studio` : '',
        subscriptionPlan: 'free',
        isBlocked: false,
        createdAt: new Date().toISOString(),
      };
      store.users.unshift(user);
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, message: 'Your account has been suspended.' },
        { status: 403 }
      );
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: 'Google login successful!',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Google auth error.' },
      { status: 500 }
    );
  }
}
