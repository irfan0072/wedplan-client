'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { User, Mail, Building2, Phone, FileText, Loader2, Save, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [image, setImage] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBusinessName(user.businessName || '');
      setImage(user.image || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        name,
        businessName,
        image,
        phone,
        bio,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">Vendor Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your public studio branding, biography, and contact numbers.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Studio Profile Picture */}
          <ImageUpload
            value={image}
            onChange={setImage}
            label="Studio Logo / Profile Photo"
            helperText="Uploaded to ImgBB and displayed on your service cards"
          />

          {/* Business Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Business / Studio Name *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Royal Elegance Weddings & Events"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Contact Person Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Lead Artisan / Contact Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Registered Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Studio Story / Philosophy
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your experience, accolades, aesthetic, and artistic approach..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Studio Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
