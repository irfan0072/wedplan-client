'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Service, Booking } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/ui/StatCard';
import {
  Store,
  CheckCircle2,
  Clock,
  Sparkles,
  PlusCircle,
  Calendar,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export default function VendorOverviewPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, bookingsRes] = await Promise.all([
          api.get('/services/vendor/my-services'),
          api.get('/bookings/vendor'),
        ]);

        if (servicesRes.success && servicesRes.services) {
          setServices(servicesRes.services);
        }
        if (bookingsRes.success && bookingsRes.bookings) {
          setBookings(bookingsRes.bookings);
        }
      } catch (err: any) {
        console.warn('Error fetching vendor data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalServices = services.length;
  const activeServices = services.filter((s) => s.isActive).length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted').length;
  const isPremium = user?.subscriptionPlan === 'premium';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Vendor Studio Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user?.businessName || user?.name} &bull; Manage your wedding catalog and client inquiries.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/vendor/services/new"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Service</span>
          </Link>
          {!isPremium && (
            <Link
              href="/dashboard/vendor/subscription"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Upgrade to Pro</span>
            </Link>
          )}
        </div>
      </div>

      {/* Free Tier Notice Banner if applicable */}
      {!isPremium && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Free Plan ({activeServices}/3 Active Services Used)
              </span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Free accounts can publish up to 3 active services. Upgrade to Premium for unlimited listings and a verified vendor badge.
            </p>
          </div>
          <Link
            href="/dashboard/vendor/subscription"
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 self-start sm:self-center shrink-0"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Services"
          value={totalServices}
          subtitle="All catalog entries"
          icon={Store}
          color="rose"
        />
        <StatCard
          title="Active Services"
          value={activeServices}
          subtitle={isPremium ? 'Unlimited tier' : 'Max 3 active'}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={pendingBookings}
          subtitle="Awaiting response"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Accepted Bookings"
          value={acceptedBookings}
          subtitle="Confirmed reservations"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Subscription"
          value={isPremium ? 'Premium' : 'Free'}
          subtitle={isPremium ? 'Unlimited listings' : 'Basic tier'}
          icon={Sparkles}
          color={isPremium ? 'purple' : 'rose'}
        />
      </div>

      {/* Pending Inquiries & Recent Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Pending Bookings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-gray-900">Pending Inquiries</h3>
            <Link
              href="/dashboard/vendor/bookings"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingBookings > 0 ? (
            <div className="space-y-3">
              {bookings
                .filter((b) => b.status === 'pending')
                .slice(0, 3)
                .map((booking) => (
                  <div
                    key={booking._id}
                    className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{booking.customerId?.name || 'Customer'}</p>
                      <p className="text-[11px] text-gray-500">{booking.serviceId?.serviceName}</p>
                    </div>
                    <Link
                      href="/dashboard/vendor/bookings"
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50"
                    >
                      Review
                    </Link>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 space-y-1">
              <Clock className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-xs font-medium">No pending inquiries</p>
            </div>
          )}
        </div>

        {/* My Catalog Preview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-gray-900">My Wedding Services</h3>
            <Link
              href="/dashboard/vendor/services"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {services.length > 0 ? (
            <div className="space-y-3">
              {services.slice(0, 3).map((service) => (
                <div
                  key={service._id}
                  className="p-3.5 rounded-xl border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={service.images[0] || ''}
                      alt={service.serviceName}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">{service.serviceName}</p>
                      <span className="text-[10px] text-gray-500 uppercase">{service.category}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      service.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : service.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 space-y-2">
              <Store className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-xs font-medium">No services created yet</p>
              <Link
                href="/dashboard/vendor/services/new"
                className="inline-block px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
              >
                Add Your First Service
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
