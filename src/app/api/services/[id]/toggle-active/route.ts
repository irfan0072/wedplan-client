import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    const service = store.services.find((s) => s._id === params.id || s.id === params.id);
    if (!service) {
      return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
    }

    if (service.vendorId?._id !== user._id && service.vendorId?.id !== user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    if (!service.isActive && user.subscriptionPlan !== 'premium') {
      const activeCount = store.services.filter(
        (s) => (s.vendorId?._id === user._id || s.vendorId?.id === user.id) && s.isActive
      ).length;

      if (activeCount >= 3) {
        return NextResponse.json(
          {
            success: false,
            message: 'Free tier limit: maximum 3 active services. Upgrade to Premium to activate more.',
          },
          { status: 403 }
        );
      }
    }

    service.isActive = !service.isActive;
    return NextResponse.json({
      success: true,
      message: `Service is now ${service.isActive ? 'Active' : 'Inactive'}.`,
      isActive: service.isActive,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
