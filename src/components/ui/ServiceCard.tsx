'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Service } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Sparkles, Tag, ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const vendor = typeof service.vendorId === 'object' ? service.vendorId : null;
  const mainImage =
    service.images && service.images.length > 0
      ? service.images[0]
      : 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80';

  const handleDetailsClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push(`/login?redirect=/services/${service._id}`);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={mainImage}
            alt={service.serviceName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Category Pill */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-rose-700 shadow-sm flex items-center space-x-1">
            <Tag className="w-3 h-3 text-rose-500" />
            <span>{service.category}</span>
          </div>

          {/* Vendor Premium Badge */}
          {vendor?.subscriptionPlan === 'premium' && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-md flex items-center space-x-1">
              <Sparkles className="w-3 h-3 fill-white" />
              <span>PRO VENDOR</span>
            </div>
          )}

          {/* Price Tag Overlay */}
          <div className="absolute bottom-3 left-3 text-white">
            <p className="text-xs uppercase tracking-wider text-rose-200 font-medium">Starting from</p>
            <p className="text-xl font-bold tracking-tight text-white drop-shadow-md">
              {formatCurrency(service.price)}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <h3 className="font-serif text-lg font-bold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-1 mb-2">
            {service.serviceName}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
            {service.description}
          </p>

          {/* Location & Vendor Info */}
          <div className="space-y-2.5 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-rose-500 shrink-0" />
              <span className="truncate">{service.location}</span>
            </div>

            {vendor && (
              <div className="flex items-center space-x-2.5 pt-1">
                <img
                  src={
                    vendor.image ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'
                  }
                  alt={vendor.businessName || vendor.name}
                  className="w-6 h-6 rounded-full object-cover border border-rose-200"
                />
                <span className="text-xs font-medium text-gray-700 truncate">
                  {vendor.businessName || vendor.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Details Action Button */}
      <div className="px-5 pb-5 pt-1">
        <Link
          href={`/services/${service._id}`}
          onClick={handleDetailsClick}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all duration-200 group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
