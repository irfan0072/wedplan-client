'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { ImageUpload } from '@/components/ui/ImageUpload';
import {
  Heart,
  Lock,
  Mail,
  User,
  Building2,
  Phone,
  Loader2,
  Check,
  Store,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation checks
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Password does not meet required security criteria.');
      return;
    }

    setLoading(true);
    await register({
      name,
      email,
      password,
      role,
      image: image || undefined,
      businessName: role === 'vendor' ? businessName : undefined,
      phone,
    });
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    await googleLogin('google.user@wedplan.com', 'Google Demo User', undefined, role);
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-rose-100 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center text-white mx-auto shadow-md shadow-rose-200">
            <Heart className="w-6 h-6 fill-white stroke-none" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-gray-500">
            Join the WedPlan community as a couple or wedding vendor.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
            Select Your Role *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                role === 'customer'
                  ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Heart className={`w-5 h-5 ${role === 'customer' ? 'text-rose-600' : 'text-gray-400'}`} />
                {role === 'customer' && <Check className="w-4 h-4 text-rose-600" />}
              </div>
              <div>
                <p className="font-serif text-sm font-bold text-gray-900">Couple / Customer</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Explore services & book vendors</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('vendor')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                role === 'vendor'
                  ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Store className={`w-5 h-5 ${role === 'vendor' ? 'text-rose-600' : 'text-gray-400'}`} />
                {role === 'vendor' && <Check className="w-4 h-4 text-rose-600" />}
              </div>
              <div>
                <p className="font-serif text-sm font-bold text-gray-900">Wedding Vendor</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Publish services & accept bookings</p>
              </div>
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eleanor Vance"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Business Name (for Vendors) */}
          {role === 'vendor' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
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
                  placeholder="e.g. Vance Couture Floral Design"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eleanor@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            {/* Password Rules Checklist */}
            <div className="pt-2 grid grid-cols-3 gap-2 text-[11px]">
              <span
                className={`flex items-center space-x-1 ${
                  hasMinLength ? 'text-emerald-600 font-semibold' : 'text-gray-400'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-500' : 'text-gray-300'}`} />
                <span>6+ Chars</span>
              </span>
              <span
                className={`flex items-center space-x-1 ${
                  hasUppercase ? 'text-emerald-600 font-semibold' : 'text-gray-400'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-500' : 'text-gray-300'}`} />
                <span>Uppercase</span>
              </span>
              <span
                className={`flex items-center space-x-1 ${
                  hasLowercase ? 'text-emerald-600 font-semibold' : 'text-gray-400'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${hasLowercase ? 'text-emerald-500' : 'text-gray-300'}`} />
                <span>Lowercase</span>
              </span>
            </div>
          </div>

          {/* Profile Image (Optional upload using ImgBB) */}
          <ImageUpload
            value={image}
            onChange={setImage}
            label="Profile Picture (Optional)"
            helperText="Upload your avatar via ImgBB"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Create {role === 'vendor' ? 'Vendor' : 'Customer'} Account</span>
            )}
          </button>
        </form>

        {/* Google Authentication Alternative */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-center space-x-2 transition-colors shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Sign Up with Google as {role === 'vendor' ? 'Vendor' : 'Customer'}</span>
        </button>

        <p className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-rose-600 hover:text-rose-700">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
