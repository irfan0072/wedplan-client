'use client';

import React, { useEffect, useState } from 'react';
import { Booking } from '@/types';
import { api } from '@/lib/api';
import { formatDate, getStatusBadge } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  User,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/vendor');
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch customer booking requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (bookingId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      setProcessingId(bookingId);
      const res = await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.success) {
        toast.success(`Booking request marked as ${newStatus}!`);
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
      } else {
        toast.error(res.message || 'Failed to update booking status.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating booking status.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">Customer Booking Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review customer inquiries for your services and accept or reject date reservations.
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusStyle = getStatusBadge(booking.status);
            const isPending = booking.status === 'pending';
            const isBusy = processingId === booking._id;

            return (
              <div
                key={booking._id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-6"
              >
                {/* Header row: Service Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        booking.serviceId?.images?.[0] ||
                        'https://images.unsplash.com/photo-1519741497674-611481863552?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={booking.serviceId?.serviceName || 'Service'}
                      className="w-12 h-12 rounded-xl object-cover border border-rose-100 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                        {booking.serviceId?.category || 'Service Inquiry'}
                      </span>
                      <h3 className="font-serif text-base font-bold text-gray-900">
                        {booking.serviceId?.serviceName || 'Wedding Service'}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border self-start sm:self-center ${statusStyle.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusStyle.dot}`} />
                    <span className="capitalize">{booking.status}</span>
                  </span>
                </div>

                {/* Grid details: Customer + Event */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  {/* Customer Info */}
                  <div className="bg-rose-50/40 rounded-2xl p-4 border border-rose-100/60 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Customer Contact
                    </p>
                    <div className="flex items-center space-x-2 font-semibold text-gray-900">
                      <User className="w-4 h-4 text-rose-500" />
                      <span>{booking.customerId?.name || 'Customer'}</span>
                    </div>
                    {booking.customerId?.email && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{booking.customerId.email}</span>
                      </div>
                    )}
                    {booking.customerId?.phone && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{booking.customerId.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Event Schedule & Venue
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                      <Calendar className="w-4 h-4 text-rose-500" />
                      <span className="font-semibold text-gray-900">Date: {formatDate(booking.eventDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>Location: {booking.eventLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Inquiry Sent: {formatDate(booking.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Message */}
                {booking.message && (
                  <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-start space-x-2 text-xs text-gray-600">
                    <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-700">Note: </span>
                      <span>"{booking.message}"</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons for Pending Inquiries */}
                {isPending ? (
                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                      disabled={isBusy}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline Request</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking._id, 'accepted')}
                      disabled={isBusy}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Accept Booking</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 flex justify-end">
                    <p className="text-xs text-gray-400 italic">
                      This inquiry has been finalized as <span className="font-semibold">{booking.status}</span>.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 shadow-sm space-y-3">
          <Calendar className="w-12 h-12 text-rose-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-900">No Booking Requests Yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            When couples discover your services on WedPlan, their reservation requests will appear here for your review.
          </p>
        </div>
      )}
    </div>
  );
}
