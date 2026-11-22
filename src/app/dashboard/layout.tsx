'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Settings,
  Store,
  PlusCircle,
  Sparkles,
  CreditCard,
  Users,
  ShieldCheck,
  Receipt,
  LogOut,
  AlertTriangle,
  Loader2,
  Heart,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push(`/login?redirect=${pathname}`);
        return;
      }

      if (user.isBlocked) {
        return; // Handled by blocked banner below
      }

      // Role isolation: prevent accessing other roles' dashboards by changing URL
      if (pathname.startsWith('/dashboard/admin') && user.role !== 'admin') {
        router.push(user.role === 'vendor' ? '/dashboard/vendor' : '/dashboard/customer');
      } else if (pathname.startsWith('/dashboard/vendor') && user.role !== 'vendor') {
        router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer');
      } else if (pathname.startsWith('/dashboard/customer') && user.role !== 'customer') {
        router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/vendor');
      }
    }
  }, [loading, isAuthenticated, user, pathname, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Account Suspension screen for blocked users
  if (user.isBlocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-gray-900">Account Suspended</h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
          Your WedPlan account has been blocked by a platform administrator. Access to protected features,
          services, and bookings is currently restricted.
        </p>
        <button
          onClick={logout}
          className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Role-based Nav Items
  let navItems: { label: string; href: string; icon: any }[] = [];

  if (user.role === 'customer') {
    navItems = [
      { label: 'Overview', href: '/dashboard/customer', icon: LayoutDashboard },
      { label: 'My Bookings', href: '/dashboard/customer/bookings', icon: Calendar },
      { label: 'Profile Settings', href: '/dashboard/customer/profile', icon: Settings },
    ];
  } else if (user.role === 'vendor') {
    navItems = [
      { label: 'Overview', href: '/dashboard/vendor', icon: LayoutDashboard },
      { label: 'My Services', href: '/dashboard/vendor/services', icon: Store },
      { label: 'Add Service', href: '/dashboard/vendor/services/new', icon: PlusCircle },
      { label: 'Booking Requests', href: '/dashboard/vendor/bookings', icon: Calendar },
      { label: 'Subscription', href: '/dashboard/vendor/subscription', icon: Sparkles },
      { label: 'Profile Settings', href: '/dashboard/vendor/profile', icon: Settings },
    ];
  } else if (user.role === 'admin') {
    navItems = [
      { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
      { label: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
      { label: 'Manage Services', href: '/dashboard/admin/services', icon: ShieldCheck },
      { label: 'Transactions', href: '/dashboard/admin/transactions', icon: Receipt },
    ];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm sticky top-28 space-y-6">
            {/* User Profile Summary */}
            <div className="flex items-center space-x-3.5 pb-6 border-b border-gray-100">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-rose-200 shrink-0">
                <img
                  src={user.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate">
                <h3 className="font-serif text-base font-bold text-gray-900 truncate">
                  {user.name}
                </h3>
                <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full mt-0.5 border border-rose-100">
                  {user.role}
                  {user.subscriptionPlan === 'premium' && (
                    <Sparkles className="w-2.5 h-2.5 ml-1 text-amber-500 fill-amber-500" />
                  )}
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-rose-600 text-white shadow-sm shadow-rose-200 font-semibold'
                        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="lg:col-span-3 min-h-[500px]">{children}</section>
      </div>
    </div>
  );
}
