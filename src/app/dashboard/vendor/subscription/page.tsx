'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Sparkles,
  Check,
  ShieldCheck,
  CreditCard,
  Loader2,
  Zap,
  Star,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';

export default function VendorSubscriptionPage() {
  const { user } = useAuth();
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const isPremium = user?.subscriptionPlan === 'premium';

  const handleUpgradeToPremium = async () => {
    try {
      setLoadingCheckout(true);
      const res = await api.post('/payment/create-checkout-session');

      if (res.success && res.url) {
        // Redirect vendor to Stripe Checkout
        window.location.href = res.url;
      } else {
        toast.error(res.message || 'Failed to initialize Stripe checkout.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error processing Stripe upgrade.');
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">Subscription & Plans</h1>
        <p className="text-sm text-gray-500 mt-1">
          Scale your wedding business with unlimited listings, priority placement, and verified vendor prestige.
        </p>
      </div>

      {/* Current Plan Status Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isPremium ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isPremium ? <Sparkles className="w-7 h-7" /> : <Star className="w-7 h-7" />}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Current Tier
            </span>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif text-2xl font-bold text-gray-900 capitalize">
                {isPremium ? 'Premium Vendor' : 'Free Standard Tier'}
              </h2>
              {isPremium && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Active
                </span>
              )}
            </div>
            {isPremium && user?.subscriptionExpiresAt && (
              <p className="text-xs text-gray-500 mt-0.5">
                Renews on {formatDate(user.subscriptionExpiresAt)}
              </p>
            )}
          </div>
        </div>

        {!isPremium && (
          <button
            onClick={handleUpgradeToPremium}
            disabled={loadingCheckout}
            className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loadingCheckout ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Upgrade to Premium ($49/yr)</span>
          </button>
        )}
      </div>

      {/* Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div
          className={`rounded-3xl p-8 border transition-all flex flex-col justify-between ${
            !isPremium
              ? 'bg-white border-rose-200 shadow-md ring-2 ring-rose-200'
              : 'bg-white/60 border-gray-200'
          }`}
        >
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Starter Tier
              </span>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1">Free Plan</h3>
              <p className="text-xs text-gray-500 mt-1">
                Essential tools to showcase your wedding portfolio.
              </p>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-xs text-gray-500 ml-1">/ forever</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            <ul className="space-y-3 text-xs text-gray-700">
              <li className="flex items-center space-x-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Publish up to 3 Active Services</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Basic Vendor Studio Dashboard</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Customer Booking Request Management</span>
              </li>
              <li className="flex items-center space-x-2.5 text-gray-400 line-through">
                <Check className="w-4 h-4 text-gray-300 shrink-0" />
                <span>Unlimited Active Services</span>
              </li>
              <li className="flex items-center space-x-2.5 text-gray-400 line-through">
                <Check className="w-4 h-4 text-gray-300 shrink-0" />
                <span>Gold Verified Vendor Badge</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              disabled
              className="w-full py-3 rounded-xl text-xs font-semibold text-gray-500 bg-gray-100 cursor-default"
            >
              {!isPremium ? 'Current Active Plan' : 'Free Tier'}
            </button>
          </div>
        </div>

        {/* Premium Plan */}
        <div
          className={`rounded-3xl p-8 border transition-all flex flex-col justify-between relative overflow-hidden ${
            isPremium
              ? 'bg-white border-amber-300 shadow-xl ring-2 ring-amber-400'
              : 'bg-gradient-to-b from-amber-50/50 to-white border-amber-200 shadow-lg'
          }`}
        >
          {/* Top highlight ribbon */}
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-4 rounded-bl-xl shadow-sm">
            Recommended
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pro Membership</span>
              </span>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1">Premium Plan</h3>
              <p className="text-xs text-gray-500 mt-1">
                Maximum visibility, unlimited catalog, and verified prestige.
              </p>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">$49</span>
                <span className="text-xs text-gray-500 ml-1">/ annual billing</span>
              </div>
            </div>

            <hr className="border-amber-100" />

            <ul className="space-y-3 text-xs text-gray-800">
              <li className="flex items-center space-x-2.5 font-semibold text-gray-900">
                <Check className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Unlimited Active Wedding Services</span>
              </li>
              <li className="flex items-center space-x-2.5 font-semibold text-gray-900">
                <Check className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Gold Verified Vendor Badge on All Listings</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Priority Directory & Homepage Placement</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Unlimited Customer Inquiries</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Stripe Verified Payment Guarantee</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            {isPremium ? (
              <div className="w-full py-3 rounded-xl text-xs font-bold text-center text-amber-900 bg-amber-100 border border-amber-200">
                ✓ You Are a Premium Vendor
              </div>
            ) : (
              <button
                onClick={handleUpgradeToPremium}
                disabled={loadingCheckout}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loadingCheckout ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                <span>Upgrade via Stripe Checkout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
