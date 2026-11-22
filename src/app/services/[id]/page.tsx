'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Service } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  MapPin,
  Tag,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ServiceDetailsPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isVendor } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');

  // Booking Form State
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [message, setMessage] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/services/${serviceId}`);
        if (res.success && res.service) {
          setService(res.service);
          if (res.service.images && res.service.images.length > 0) {
            setActiveImage(res.service.images[0]);
          }
        } else {
          setError('Wedding service not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load wedding service details.');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const vendor = typeof service?.vendorId === 'object' ? service?.vendorId : null;
  const isOwner = vendor && user && vendor._id === user.id;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to submit a booking request.');
      router.push(`/login?redirect=/services/${serviceId}`);
      return;
    }

    if (isAdmin) {
      toast.error('Administrators cannot submit customer booking requests.');
      return;
    }

    if (isOwner) {
      toast.error('You cannot book your own wedding service.');
      return;
    }

    if (!eventDate || !eventLocation) {
      toast.error('Please specify both your event date and event location.');
      return;
    }

    try {
      setBookingSubmitting(true);
      const res = await api.post('/bookings', {
        serviceId,
        eventDate,
        eventLocation,
        message,
      });

      if (res.success) {
        setBookingSuccess(true);
        toast.success('Booking request submitted! The vendor has been notified.');
      } else {
        toast.error(res.message || 'Failed to submit booking request.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Booking submission failed.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900">Service Not Available</h2>
        <p className="text-sm text-gray-500">{error || 'This service could not be found or has been removed.'}</p>
        <Link
          href="/services"
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Browse Services</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <div>
        <Link
          href="/services"
          className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Image Gallery & Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Hero Image */}
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-lg border border-rose-100 bg-slate-100">
            <img
              src={activeImage || service.images[0]}
              alt={service.serviceName}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {vendor?.subscriptionPlan === 'premium' && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                <span>PREMIUM VENDOR</span>
              </div>
            )}
          </div>

          {/* Image Thumbnails Gallery */}
          {service.images && service.images.length > 1 && (
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-none">
              {service.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-24 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === img ? 'border-rose-600 ring-2 ring-rose-200' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title & Metadata */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100">
                <Tag className="w-3 h-3 text-rose-500" />
                <span>{service.category}</span>
              </span>
              <span className="inline-flex items-center space-x-1 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{service.location}</span>
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {service.serviceName}
            </h1>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-8 border border-rose-100 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-gray-900">About This Service</h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {service.description}
            </p>
          </div>

          {/* Vendor Information Box */}
          {vendor && (
            <div className="bg-white rounded-2xl p-8 border border-rose-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <img
                src={vendor.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={vendor.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-rose-200 shadow-sm shrink-0"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-serif text-lg font-bold text-gray-900">
                    {vendor.businessName || vendor.name}
                  </h4>
                  {vendor.subscriptionPlan === 'premium' && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">WedPlan Partner Vendor & Artisan</p>
                {vendor.email && <p className="text-xs text-gray-400">{vendor.email}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Booking Request Form */}
        <div className="space-y-6">
          <div className="sticky top-28 bg-white rounded-3xl p-8 border border-rose-100 shadow-xl space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Starting Investment
              </p>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="font-serif text-4xl font-bold text-gray-900">
                  {formatCurrency(service.price)}
                </span>
                <span className="text-xs text-gray-500">/ package</span>
              </div>
            </div>

            <hr className="border-rose-100" />

            {/* Booking Form or Confirmation */}
            {bookingSuccess ? (
              <div className="text-center py-6 space-y-3 bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-lg font-bold text-emerald-900">
                  Request Received!
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Your booking request has been delivered to the vendor. Track updates anytime from your Customer Dashboard.
                </p>
                <Link
                  href="/dashboard/customer/bookings"
                  className="inline-block mt-3 px-5 py-2 rounded-full text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  View My Bookings
                </Link>
              </div>
            ) : isOwner ? (
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 text-center space-y-2">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Vendor Notice</p>
                <p className="text-xs text-amber-700">
                  You are the owner of this service. You can update or review inquiries for this service in your Vendor Dashboard.
                </p>
                <Link
                  href="/dashboard/vendor/services"
                  className="inline-block mt-2 px-4 py-2 rounded-lg text-xs font-semibold text-amber-900 bg-amber-200 hover:bg-amber-300"
                >
                  Manage Service
                </Link>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <h4 className="font-serif text-lg font-bold text-gray-900">
                  Request Booking
                </h4>

                {/* Event Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Event Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Event Location */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Event Venue / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tribeca Rooftop, NYC"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Message to Vendor (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share guest count, wedding schedule, or specific requirements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {bookingSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Booking Request</span>
                    </>
                  )}
                </button>

                {!isAuthenticated && (
                  <p className="text-[11px] text-center text-gray-400">
                    You will be redirected to sign in before finalizing your request.
                  </p>
                )}
              </form>
            )}

            <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Vetted Vendor & Protected Booking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
