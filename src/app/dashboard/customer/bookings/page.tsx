'use client';

import React, { useEffect, useState } from 'react';
import { Booking } from '@/types';
import { api } from '@/lib/api';
import { formatDate, getStatusBadge } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Clock,
  XCircle,
  Eye,
  Loader2,
  X,
  AlertCircle,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/customer');
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking request? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      if (res.success) {
        toast.success('Booking request cancelled successfully.');
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status: 'cancelled' });
        }
      } else {
        toast.error(res.message || 'Failed to cancel booking.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error cancelling booking request.');
    } finally {
      setCancellingId(null);
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
        <h1 className="font-serif text-3xl font-bold text-gray-900">My Booking Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review details of all your requested wedding appointments and vendor responses.
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusStyle = getStatusBadge(booking.status);
            const isPending = booking.status === 'pending';

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Service & Vendor Info */}
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      booking.serviceId?.images?.[0] ||
                      'https://images.unsplash.com/photo-1519741497674-611481863552?w=120&auto=format&fit=crop&q=80'
                    }
                    alt={booking.serviceId?.serviceName || 'Service'}
                    className="w-20 h-20 rounded-2xl object-cover border border-rose-100 shrink-0"
                  />
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      {booking.serviceId?.category || 'Wedding Service'}
                    </span>
                    <h3 className="font-serif text-base font-bold text-gray-900">
                      {booking.serviceId?.serviceName || 'Wedding Service'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Vendor: <span className="font-medium text-gray-800">{booking.vendorId?.businessName || booking.vendorId?.name}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-rose-500" />
                        {formatDate(booking.eventDate)}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500" />
                        {booking.eventLocation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusStyle.dot}`} />
                      <span className="capitalize">{booking.status}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400">
                    Requested on {formatDate(booking.createdAt)}
                  </p>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                      <span>Details</span>
                    </button>

                    {isPending && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancellingId === booking._id}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-1 disabled:opacity-50"
                      >
                        {cancellingId === booking._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 shadow-sm space-y-3">
          <Calendar className="w-12 h-12 text-rose-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-900">No Booking Requests Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            You have not submitted any booking requests yet. Discover venues, photographers, and decor specialists in our directory.
          </p>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                Booking In Details
              </span>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mt-2">
                {selectedBooking.serviceId?.serviceName}
              </h3>
            </div>

            <div className="space-y-4 text-sm divide-y divide-gray-100">
              <div className="pt-2 flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    getStatusBadge(selectedBooking.status).bg
                  }`}
                >
                  <span className="capitalize">{selectedBooking.status}</span>
                </span>
              </div>

              <div className="pt-3 flex justify-between">
                <span className="text-gray-500">Event Date</span>
                <span className="font-medium text-gray-900">{formatDate(selectedBooking.eventDate)}</span>
              </div>

              <div className="pt-3 flex justify-between">
                <span className="text-gray-500">Venue Location</span>
                <span className="font-medium text-gray-900 text-right">{selectedBooking.eventLocation}</span>
              </div>

              <div className="pt-3 flex justify-between">
                <span className="text-gray-500">Vendor</span>
                <span className="font-medium text-gray-900">
                  {selectedBooking.vendorId?.businessName || selectedBooking.vendorId?.name}
                </span>
              </div>

              {selectedBooking.vendorId?.email && (
                <div className="pt-3 flex justify-between">
                  <span className="text-gray-500">Vendor Email</span>
                  <span className="font-medium text-gray-900">{selectedBooking.vendorId?.email}</span>
                </div>
              )}

              {selectedBooking.message && (
                <div className="pt-3 space-y-1">
                  <span className="text-gray-500 block">Your Note to Vendor:</span>
                  <p className="bg-slate-50 p-3 rounded-xl text-xs text-gray-700 italic border border-gray-100">
                    "{selectedBooking.message}"
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              {selectedBooking.status === 'pending' && (
                <button
                  onClick={() => handleCancelBooking(selectedBooking._id)}
                  disabled={cancellingId === selectedBooking._id}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
