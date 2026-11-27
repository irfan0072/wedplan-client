import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import {
  isMongoConfigured,
  connectMongo,
  ServiceModel,
  BookingModel,
  serializeDoc,
  mongoJson,
} from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

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

    if (isMongoConfigured()) {
      await connectMongo();
      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return mongoJson({ success: false, message: 'Service not found.' }, 404);
      }
      const serviceDoc = await ServiceModel.findById(serviceId);
      if (!serviceDoc || serviceDoc.status !== 'approved' || !serviceDoc.isActive) {
        return mongoJson(
          { success: false, message: 'Service not found or not currently available.' },
          404
        );
      }
      if (serviceDoc.vendorId.toString() === user._id) {
        return mongoJson(
          { success: false, message: 'You cannot book your own wedding service.' },
          400
        );
      }

      const dayStart = new Date(eventDate);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(eventDate);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const duplicate = await BookingModel.findOne({
        serviceId: serviceDoc._id,
        customerId: user._id,
        eventDate: { $gte: dayStart, $lte: dayEnd },
        status: { $in: ['pending', 'accepted'] },
      });

      if (duplicate) {
        return mongoJson(
          {
            success: false,
            message: 'You already have an active booking request for this service on this date.',
          },
          400
        );
      }

      const created = await BookingModel.create({
        serviceId: serviceDoc._id,
        vendorId: serviceDoc.vendorId,
        customerId: user._id,
        eventDate: new Date(eventDate),
        eventLocation,
        message: message || '',
        status: 'pending',
      });

      const populated = await created.populate([
        { path: 'serviceId', select: 'serviceName images price category location' },
        { path: 'vendorId', select: 'name businessName email phone image' },
        { path: 'customerId', select: 'name email phone image' },
      ]);

      return mongoJson(
        {
          success: true,
          message: 'Booking request submitted successfully!',
          booking: serializeDoc(populated),
        },
        201
      );
    }

    const service = store.services.find((s) => s._id === serviceId || s.id === serviceId);
    if (!service) {
      return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
    }

    if (service.vendorId?._id === user._id || service.vendorId?.id === user.id) {
      return NextResponse.json(
        { success: false, message: 'You cannot book your own wedding service.' },
        { status: 400 }
      );
    }

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
