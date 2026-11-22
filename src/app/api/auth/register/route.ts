import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { store, generateToken } from '@/lib/server-store';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, image, businessName, phone } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields.' },
        { status: 400 }
      );
    }

    if (role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin accounts cannot be created via public registration.' },
        { status: 403 }
      );
    }

    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      return NextResponse.json(
        { success: false, message: 'Password must have 6+ chars, uppercase, and lowercase.' },
        { status: 400 }
      );
    }

    const exists = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
      _id: `usr_${Date.now()}`,
      id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      image: image || undefined,
      businessName: role === 'vendor' ? businessName || `${name}'s Wedding Studio` : '',
      phone: phone || '',
      subscriptionPlan: 'free',
      isBlocked: false,
      createdAt: new Date().toISOString(),
    };

    store.users.unshift(newUser);
    const token = generateToken(newUser);
    const { password: _, ...safeUser } = newUser;

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully!',
        token,
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error registering.' },
      { status: 500 }
    );
  }
}
