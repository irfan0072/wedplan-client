'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Service } from '@/types';
import { api } from '@/lib/api';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { CategoryCard } from '@/components/ui/CategoryCard';
import {
  Heart,
  Sparkles,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Award,
  ArrowRight,
  Users,
  Compass,
} from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Photography & Videography',
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Wedding Venues',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Decoration & Florist',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Catering Services',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Makeup & Styling',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Wedding Fashion',
    image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600&auto=format&fit=crop&q=80',
  },
];

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/services/featured');
        if (res.success && res.services) {
          setFeaturedServices(res.services);
        }
      } catch (err: any) {
        console.warn('Could not load featured services from live API:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&auto=format&fit=crop&q=85"
            alt="Wedding Celebration"
            className="w-full h-full object-cover object-center filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-transparent" />
        </div>

        {/* Hero Content with Framer Motion */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-rose-200 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>The Premier Wedding Planning Platform</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
              Curate Your Unforgettable <br />
              <span className="italic font-normal bg-gradient-to-r from-rose-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                Dream Wedding
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 leading-relaxed font-light">
              Connect with vetted wedding venues, master cinematographers, floral designers, and
              couture artisans. Request bookings seamlessly and track your celebration journey.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/services"
                className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Explore Wedding Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold text-white bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/30 transition-all"
              >
                Join as a Vendor
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. DYNAMIC SECTION 1: FEATURED WEDDING SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Handpicked Excellence</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Featured Wedding Services
            </h2>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Discover top-rated services approved and curated by the WedPlan concierge team.
            </p>
          </div>
          <Link
            href="/services"
            className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : featuredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8">
            <Heart className="w-12 h-12 text-rose-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Featured Services Refreshing</h3>
            <p className="text-sm text-gray-500 mt-1">
              Browse all approved wedding services in our catalog.
            </p>
            <Link
              href="/services"
              className="mt-4 inline-block px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700"
            >
              Browse Services
            </Link>
          </div>
        )}
      </section>

      {/* 3. DYNAMIC SECTION 2: WEDDING SERVICE CATEGORIES */}
      <section className="bg-rose-50/50 py-16 border-y border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
              Categories
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
              Explore Wedding Categories
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              From breathtaking waterfront venues to bespoke couture and artisanal cuisine, find
              every piece of your wedding tapestry.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.name} name={cat.name} image={cat.image} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE WEDPLAN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
            The WedPlan Advantage
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
            Why Discerning Couples Choose WedPlan
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            A seamless bridge between visionary vendors and couples crafting their most cherished memories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900">Vetted & Approved Vendors</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Every vendor profile and service submission undergoes thorough admin review before
              appearing on the public directory.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900">Direct Booking Pipeline</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Submit structured booking inquiries with specific dates and locations. Track acceptances
              and cancellations in real-time.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900">Verified Secure Payments</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Powered by Stripe Checkout with cryptographic webhook confirmation. Vendors enjoy
              unlimited listings and premium badges.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW WEDPLAN WORKS */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
              Simple 3-Step Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
              How WedPlan Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From inspiration to celebration in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="relative p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Discover & Filter</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Filter by wedding category, event location, and pricing. Explore high-resolution photo
                galleries and vendor bios.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Request Your Date</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Choose your ceremony date, enter your celebration location, and send customized notes
                directly to the vendor.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Celebrate With Joy</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Review vendor confirmations on your Customer Dashboard. Enjoy complete peace of mind
                as your big day arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 rounded-3xl p-10 sm:p-14 text-white shadow-xl shadow-rose-600/20 space-y-6">
          <Heart className="w-12 h-12 mx-auto fill-white text-rose-600 stroke-none animate-pulse" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Begin Planning Your Wedding Today
          </h2>
          <p className="max-w-xl mx-auto text-rose-100 text-sm sm:text-base leading-relaxed">
            Join thousands of couples creating magic with WedPlan. Explore our verified registry of
            wedding artisans today.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/services"
              className="px-8 py-3.5 rounded-full font-semibold text-rose-700 bg-white hover:bg-rose-50 shadow-md transition-all hover:scale-105"
            >
              Browse Wedding Services
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-full font-semibold text-white bg-rose-800/50 hover:bg-rose-800 border border-white/20 transition-all"
            >
              Vendor Registration
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
