'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Booking } from '@/types';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { formatDate, getStatusBadge } from '@/lib/utils';
import { Calendar, Clock, CheckCircle2, XCircle, ArrowRight, Loader2, Heart } from 'lucide-react';

export default function CustomerOverviewPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/bookings/customer');
        if (res.success && res.bookings) {
          setBookings(res.bookings);
        }
      } catch (err: any) {
        console.warn('Error fetching customer bookings:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted').length;
  const rejectedBookings = bookings.filter((b) => b.status === 'rejected' || b.status === 'cancelled').length;

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
        <h1 className="font-serif text-3xl font-bold text-gray-900">Customer Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor your wedding vendor inquiries, confirmed dates, and status updates.
        </p>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={totalBookings}
          subtitle="All inquiries submitted"
          icon={Calendar}
          color="rose"
        />
        <StatCard
          title="Pending Bookings"
          value={pendingBookings}
          subtitle="Awaiting vendor reply"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Accepted Bookings"
          value={acceptedBookings}
          subtitle="Confirmed reservations"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Declined / Cancelled"
          value={rejectedBookings}
          subtitle="Closed inquiries"
          icon={XCircle}
          color="purple"
        />
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">Recent Booking Requests</h2>
            <p className="text-xs text-gray-400 mt-0.5">Your most recent vendor inquiries</p>
          </div>
          <Link
            href="/dashboard/customer/bookings"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {bookings.slice(0, 5).map((booking) => {
              const statusStyle = getStatusBadge(booking.status);
              return (
                <div key={booking._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        booking.serviceId?.images?.[0] ||
                        'https://images.unsplash.com/photo-1519741497674-611481863552?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={booking.serviceId?.serviceName || 'Service'}
                      className="w-14 h-14 rounded-2xl object-cover border border-rose-100 shrink-0"
                    />
                    <div>
                      <h4 className="font-serif text-sm font-bold text-gray-900 line-clamp-1">
                        {booking.serviceId?.serviceName || 'Wedding Service'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Vendor: {booking.vendorId?.businessName || booking.vendorId?.name || 'Wedding Vendor'}
                      </p>
                      <p className="text-xs text-rose-600 font-medium mt-0.5">
                        Event Date: {formatDate(booking.eventDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusStyle.dot}`} />
                      <span className="capitalize">{booking.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <Heart className="w-10 h-10 text-rose-200 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">No booking requests submitted yet</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Browse our verified wedding services catalog and submit your first booking request to reserve your date.
            </p>
            <Link
              href="/services"
              className="inline-block mt-2 px-5 py-2 rounded-full text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
            >
              Browse Services
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
