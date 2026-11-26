import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader, handleApiError } from '@/lib/server-store';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (user.role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Administrators cannot submit customer booking requests.' },
        { status: 403 }
      );
    }

    const { serviceId, eventDate, eventLocation, message } = await req.json();
    if (!serviceId || !eventDate || !eventLocation) {
      return NextResponse.json(
        { success: false, message: 'Please provide service ID, event date, and location.' },
        { status: 400 }
      );
    }

    const service = store.services.find((s) => s._id === serviceId || s.id === serviceId);
    if (!service) {
      return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
    }

    // Prevent vendor from booking own service
    if (service.vendorId?._id === user._id || service.vendorId?.id === user.id) {
      return NextResponse.json(
        { success: false, message: 'You cannot book your own wedding service.' },
        { status: 400 }
      );
    }

    // Prevent duplicate active booking for same service and date
    const reqDate = new Date(eventDate).toISOString().split('T')[0];
    const duplicate = store.bookings.find((b) => {
      const bDate = new Date(b.eventDate).toISOString().split('T')[0];
      const isSameService = b.serviceId?._id === service._id || b.serviceId?.id === service.id;
      const isSameCustomer = b.customerId?._id === user._id || b.customerId?.id === user.id;
      const isActiveStatus = ['pending', 'accepted'].includes(b.status);
      return isSameService && isSameCustomer && bDate === reqDate && isActiveStatus;
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: 'You already have an active booking request for this service on this date.',
        },
        { status: 400 }
      );
    }

    const newBooking = {
      _id: `bkg_${Date.now()}`,
      id: `bkg_${Date.now()}`,
      serviceId: service,
      vendorId: service.vendorId,
      customerId: user,
      eventDate: new Date(eventDate).toISOString(),
      eventLocation,
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    store.bookings.unshift(newBooking);

    return NextResponse.json(
      {
        success: true,
        message: 'Booking request submitted successfully!',
        booking: newBooking,
      },
      { status: 201 }
    );
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
