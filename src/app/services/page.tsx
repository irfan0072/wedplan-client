'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Service } from '@/types';
import { api } from '@/lib/api';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { WEDDING_CATEGORIES } from '@/lib/utils';
import { Search, MapPin, Filter, SlidersHorizontal, Loader2, Sparkles, X } from 'lucide-react';

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category && category !== 'All') params.set('category', category);
      if (location) params.set('location', location);
      if (sort) params.set('sort', sort);

      const res = await api.get(`/services?${params.toString()}`);
      if (res.success && res.services) {
        setServices(res.services);
      }
    } catch (err: any) {
      console.warn('Error fetching services:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [category, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('');
    setSort('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Curated Wedding Directory</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
          Browse Wedding Services
        </h1>
        <p className="text-sm text-gray-500">
          Discover vetted wedding venues, photographers, florists, and stylists for your special day.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Location Search */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="City or location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Sorting */}
          <div className="relative">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="newest">Sort: Newest Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Filter</span>
            </button>
            {(search || location || category !== 'All') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Reset filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
          <button
            onClick={() => setCategory('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              category === 'All'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            All Categories
          </button>
          {WEDDING_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid or States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100 shadow-sm"
            />
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-2xl border border-rose-100 p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-gray-900">No Services Found</h3>
          <p className="text-sm text-gray-500 mt-2">
            We couldn't find any approved wedding services matching your current filter criteria.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function BrowseServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
