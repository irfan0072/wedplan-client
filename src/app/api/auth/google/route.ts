import { NextRequest, NextResponse } from 'next/server';
import { store, generateToken } from '@/lib/server-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, image, role = 'customer', accessToken, idToken, googleId } = body;

    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedImage = image;

    // If an accessToken is provided from Google Identity Services, verify it against Google OAuth2 userinfo API
    if (accessToken) {
      try {
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (googleRes.ok) {
          const googleUser = await googleRes.json();
          if (googleUser.email) {
            verifiedEmail = googleUser.email;
            verifiedName = googleUser.name || verifiedName;
            verifiedImage = googleUser.picture || verifiedImage;
          }
        }
      } catch (err: any) {
        console.warn('Google accessToken verification call failed, falling back:', err.message);
      }
    }

    if (!verifiedEmail) {
      return NextResponse.json(
        { success: false, message: 'Google account details missing or could not be verified.' },
        { status: 400 }
      );
    }

    let user = store.users.find((u) => u.email.toLowerCase() === verifiedEmail.toLowerCase());

    if (!user) {
      const assignedRole = role === 'vendor' ? 'vendor' : 'customer';
      user = {
        _id: `usr_${Date.now()}`,
        id: `usr_${Date.now()}`,
        name: verifiedName || verifiedEmail.split('@')[0],
        email: verifiedEmail.toLowerCase(),
        image: verifiedImage,
        role: assignedRole,
        businessName: assignedRole === 'vendor' ? `${verifiedName || 'Vendor'}'s Wedding Studio` : '',
        subscriptionPlan: 'free',
        isBlocked: false,
        createdAt: new Date().toISOString(),
      };
      store.users.unshift(user);
    } else {
      // Update image or name if missing
      if (verifiedImage && !user.image) user.image = verifiedImage;
      if (verifiedName && !user.name) user.name = verifiedName;
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, message: 'Your account has been suspended by an administrator.' },
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
