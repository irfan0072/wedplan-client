import React from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-rose-100 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center shadow-sm">
          <Heart className="w-8 h-8 text-rose-400 stroke-1" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            Error 404
          </span>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mt-2">
            Page Not Found
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            The wedding page or service you are searching for might have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/services"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse Services</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
