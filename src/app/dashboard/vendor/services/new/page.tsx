'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { WEDDING_CATEGORIES } from '@/lib/utils';
import {
  PlusCircle,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AddServicePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState<string>(WEDDING_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLimitError(null);

    if (!serviceName || !category || !description || !price || !location) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/services', {
        serviceName,
        category,
        description,
        price: Number(price),
        location,
        images: image ? [image] : undefined,
      });

      if (res.success) {
        toast.success('Wedding service submitted successfully! Status is set to Pending for admin approval.');
        router.push('/dashboard/vendor/services');
      } else {
        toast.error(res.message || 'Failed to submit service.');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('limit reached')) {
        setLimitError(err.message);
      }
      toast.error(err.message || 'Error submitting service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Back button */}
      <Link
        href="/dashboard/vendor/services"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-rose-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Services</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">Add New Wedding Service</h1>
        <p className="text-sm text-gray-500 mt-1">
          Publish a new wedding service to be reviewed and approved for the public directory.
        </p>
      </div>

      {/* Free Plan Limit Alert if encountered */}
      {limitError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start space-x-3 text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-semibold">{limitError}</p>
            <Link
              href="/dashboard/vendor/subscription"
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade to Premium Plan</span>
            </Link>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Service Name / Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cinematic 4K Wedding Storytelling & Drone Film"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Wedding Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                {WEDDING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Base Investment (USD) *
              </label>
              <input
                type="number"
                required
                min={0}
                placeholder="2500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Service Location / Region *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. New York, NY & Surrounding Tri-State Area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Detailed Service Description *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe packages, deliverables, timing, and what couples can expect..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
            />
          </div>

          {/* Service Image via ImgBB */}
          <ImageUpload
            value={image}
            onChange={setImage}
            label="Service Showcase Image (Uploaded to ImgBB) *"
            helperText="High quality photo of your work (JPG, PNG or WebP)"
          />

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Service...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish for Approval</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
