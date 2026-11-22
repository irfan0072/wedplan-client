import React from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-rose-100 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center shadow-sm">
          <XCircle className="w-9 h-9" />
        </div>

        <h2 className="font-serif text-3xl font-bold text-gray-900">
          Payment Cancelled
        </h2>

        <p className="text-xs text-gray-500 leading-relaxed">
          Your Stripe checkout process was not completed. No charges have been made to your account.
          You can retry your upgrade anytime from your vendor subscription panel.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/dashboard/vendor/subscription"
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </Link>
          <Link
            href="/dashboard/vendor"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Return to Vendor Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
