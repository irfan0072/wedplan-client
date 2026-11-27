import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { store, generateToken } from '@/lib/server-store';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both email and password.' },
        { status: 400 }
      );
    }

    const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password credentials.' },
        { status: 401 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, message: 'Your account has been suspended by an administrator.' },
        { status: 403 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Account registered using Google. Please sign in with Google.' },
        { status: 400 }
      );
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password credentials.' },
        { status: 401 }
      );
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Login error.' },
      { status: 500 }
    );
  }
}
