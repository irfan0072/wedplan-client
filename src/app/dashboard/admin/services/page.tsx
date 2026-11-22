'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Service } from '@/types';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusBadge, WEDDING_CATEGORIES } from '@/lib/utils';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Power,
  Trash2,
  Loader2,
  Sparkles,
  MapPin,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

function AdminServicesContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);

      const res = await api.get(`/admin/services?${params.toString()}`);
      if (res.success && res.services) {
        setServices(res.services);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch services for admin review.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const handleUpdateStatus = async (serviceId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setProcessingId(serviceId);
      const res = await api.patch(`/admin/services/${serviceId}/status`, { status: newStatus });
      if (res.success) {
        toast.success(`Service marked as ${newStatus}!`);
        setServices((prev) =>
          prev.map((s) => (s._id === serviceId ? { ...s, status: newStatus } : s))
        );
      } else {
        toast.error(res.message || 'Failed to update service status.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating service status.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActive = async (serviceId: string, currentActive: boolean) => {
    try {
      setProcessingId(serviceId);
      const res = await api.patch(`/admin/services/${serviceId}/status`, { isActive: !currentActive });
      if (res.success) {
        toast.success(`Service availability updated.`);
        setServices((prev) =>
          prev.map((s) => (s._id === serviceId ? { ...s, isActive: !currentActive } : s))
        );
      } else {
        toast.error(res.message || 'Failed to update availability.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error toggling availability.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to permanently delete this service? This cannot be undone.')) {
      return;
    }

    try {
      setProcessingId(serviceId);
      const res = await api.delete(`/admin/services/${serviceId}`);
      if (res.success) {
        toast.success('Service deleted permanently by admin.');
        setServices((prev) => prev.filter((s) => s._id !== serviceId));
      } else {
        toast.error(res.message || 'Failed to delete service.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting service.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">Manage Wedding Services</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review, approve, reject, or moderate vendor listings across all categories.
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search services or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="all">All Categories</option>
              {WEDDING_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approvals</option>
              <option value="approved">Approved Listings</option>
              <option value="rejected">Rejected Services</option>
            </select>
          </div>
        </form>
      </div>

      {/* Services List / Table */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : services.length > 0 ? (
        <div className="space-y-4">
          {services.map((service) => {
            const statusStyle = getStatusBadge(service.status);
            const vendor = typeof service.vendorId === 'object' ? service.vendorId : null;
            const isBusy = processingId === service._id;

            return (
              <div
                key={service._id}
                className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Media & Details */}
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      service.images[0] ||
                      'https://images.unsplash.com/photo-1519741497674-611481863552?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={service.serviceName}
                    className="w-24 h-24 rounded-2xl object-cover border border-rose-100 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        {service.category}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusStyle.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${statusStyle.dot}`} />
                        <span>{service.status}</span>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          service.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-gray-900 line-clamp-1">
                      {service.serviceName}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-1">
                      {service.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 text-xs text-gray-500 pt-1">
                      <span className="font-bold text-gray-900">{formatCurrency(service.price)}</span>
                      <span>&bull;</span>
                      <span>{service.location}</span>
                      <span>&bull;</span>
                      <span>Vendor: {vendor?.businessName || vendor?.name || 'Vendor'}</span>
                    </div>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  {/* Approve */}
                  {service.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(service._id, 'approved')}
                      disabled={isBusy}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center space-x-1 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {/* Reject */}
                  {service.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(service._id, 'rejected')}
                      disabled={isBusy}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center space-x-1 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  {/* Toggle Active */}
                  <button
                    onClick={() => handleToggleActive(service._id, service.isActive)}
                    disabled={isBusy}
                    className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
                    title={service.isActive ? 'Deactivate listing' : 'Activate listing'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Permanently */}
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    disabled={isBusy}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 shadow-sm space-y-2">
          <ShieldCheck className="w-10 h-10 text-rose-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-900">No Services Found</h3>
          <p className="text-xs text-gray-500">There are no services matching the current filter parameters.</p>
        </div>
      )}
    </div>
  );
}

export default function AdminServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      }
    >
      <AdminServicesContent />
    </Suspense>
  );
}
