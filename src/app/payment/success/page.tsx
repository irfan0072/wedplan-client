'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { CheckCircle2, Sparkles, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refreshUser } = useAuth();

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('Verifying Stripe payment confirmation...');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerifying(false);
        setMessage('Missing checkout session ID.');
        return;
      }

      try {
        const res = await api.post('/payment/verify-session', { sessionId });
        if (res.success) {
          if (res.token) {
            localStorage.setItem('wedplan_token', res.token);
          }
          setSuccess(true);
          setMessage('Your payment has been verified! Your account has been upgraded to Premium.');
          toast.success('Welcome to WedPlan Premium!');
          await refreshUser();
        } else {
          setMessage(res.message || 'Payment verification failed.');
        }
      } catch (err: any) {
        setMessage(err.message || 'Error communicating with verification service.');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-rose-100 shadow-xl text-center space-y-6">
        {verifying ? (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-rose-600 animate-spin mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              Confirming Transaction
            </h2>
            <p className="text-xs text-gray-500">{message}</p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Premium Membership Activated</span>
            </span>

            <h2 className="font-serif text-3xl font-bold text-gray-900">
              Payment Confirmed!
            </h2>

            <p className="text-xs text-gray-600 leading-relaxed">{message}</p>

            <div className="bg-rose-50/50 rounded-2xl p-4 text-xs text-gray-600 border border-rose-100 text-left space-y-1.5">
              <div className="flex items-center space-x-2 text-rose-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Your New Privileges:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600 pl-1">
                <li>Publish unlimited active wedding services</li>
                <li>Exclusive Gold Verified Vendor Badge</li>
                <li>Priority listing in search & category feeds</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/dashboard/vendor/services/new"
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Publish New Service</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/vendor"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Return to Vendor Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-gray-900">Notice</h2>
            <p className="text-xs text-gray-600">{message}</p>
            <Link
              href="/dashboard/vendor/subscription"
              className="inline-block mt-4 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
            >
              Back to Subscription
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
