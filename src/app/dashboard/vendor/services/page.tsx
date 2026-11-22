'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Service } from '@/types';
import { api } from '@/lib/api';
import { formatCurrency, getStatusBadge, WEDDING_CATEGORIES } from '@/lib/utils';
import { ImageUpload } from '@/components/ui/ImageUpload';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Power,
  Eye,
  Loader2,
  X,
  Sparkles,
  MapPin,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

export default function VendorServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editLocation, setEditLocation] = useState('');
  const [editImage, setEditImage] = useState('');

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services/vendor/my-services');
      if (res.success && res.services) {
        setServices(res.services);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load your services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleActive = async (serviceId: string) => {
    try {
      const res = await api.patch(`/services/${serviceId}/toggle-active`);
      if (res.success) {
        toast.success(res.message);
        setServices((prev) =>
          prev.map((s) => (s._id === serviceId ? { ...s, isActive: res.isActive } : s))
        );
      } else {
        toast.error(res.message || 'Failed to update availability.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error toggling availability.');
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to permanently delete this service?')) {
      return;
    }

    try {
      setDeletingId(serviceId);
      const res = await api.delete(`/services/${serviceId}`);
      if (res.success) {
        toast.success('Service deleted successfully.');
        setServices((prev) => prev.filter((s) => s._id !== serviceId));
      } else {
        toast.error(res.message || 'Failed to delete service.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting service.');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setEditName(service.serviceName);
    setEditCategory(service.category);
    setEditDescription(service.description);
    setEditPrice(service.price);
    setEditLocation(service.location);
    setEditImage(service.images[0] || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      setSavingEdit(true);
      const res = await api.put(`/services/${editingService._id}`, {
        serviceName: editName,
        category: editCategory,
        description: editDescription,
        price: editPrice,
        location: editLocation,
        images: editImage ? [editImage] : editingService.images,
      });

      if (res.success && res.service) {
        toast.success('Service updated successfully!');
        setServices((prev) =>
          prev.map((s) => (s._id === editingService._id ? res.service : s))
        );
        setEditingService(null);
      } else {
        toast.error(res.message || 'Failed to update service.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating service.');
    } finally {
      setSavingEdit(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">My Wedding Services</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your service listings, review approval states, and control visibility.
          </p>
        </div>
        <Link
          href="/dashboard/vendor/services/new"
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm flex items-center space-x-1.5 self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Service</span>
        </Link>
      </div>

      {/* Services List */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const statusStyle = getStatusBadge(service.status);

            return (
              <div
                key={service._id}
                className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                    <img
                      src={
                        service.images[0] ||
                        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={service.serviceName}
                      className="w-full h-full object-cover"
                    />

                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-sm ${statusStyle.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusStyle.dot}`} />
                        <span>{service.status}</span>
                      </span>
                    </div>

                    {/* Availability badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                          service.isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="inline-flex items-center space-x-1 text-rose-600 font-semibold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{service.category}</span>
                      </span>
                      <span className="font-bold text-gray-900 text-base">
                        {formatCurrency(service.price)}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-gray-900 line-clamp-1">
                      {service.serviceName}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="flex items-center text-xs text-gray-500 pt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500 shrink-0" />
                      <span className="truncate">{service.location}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(service._id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                      service.isActive
                        ? 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-100'
                        : 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{service.isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-2 rounded-lg text-gray-600 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 bg-white"
                      title="Edit Service"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      disabled={deletingId === service._id}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 bg-white disabled:opacity-50"
                      title="Delete Service"
                    >
                      {deletingId === service._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 shadow-sm space-y-3">
          <PlusCircle className="w-12 h-12 text-rose-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-900">No Services Published Yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Create your first wedding service listing to start receiving customer booking inquiries.
          </p>
          <Link
            href="/dashboard/vendor/services/new"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
          >
            Create Your First Service
          </Link>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setEditingService(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-gray-900">
              Edit Wedding Service
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-gray-700">Service Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-700">Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    {WEDDING_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-700">Price (USD) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-gray-700">Location *</label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-gray-700">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                />
              </div>

              <ImageUpload
                value={editImage}
                onChange={setEditImage}
                label="Update Service Image"
              />

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
