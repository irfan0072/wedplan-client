'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  Store,
  UserCheck,
  ShieldCheck,
  Clock,
  Receipt,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        if (res.success) {
          setStats(res.stats);
          setRecentTransactions(res.recentTransactions || []);
        }
      } catch (err: any) {
        console.warn('Error fetching admin statistics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">Admin Control Center</h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform-wide metrics, service approvals, and real-time transaction oversight.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          subtitle="All platform accounts"
          icon={Users}
          color="rose"
        />
        <StatCard
          title="Wedding Vendors"
          value={stats?.totalVendors || 0}
          subtitle="Service providers"
          icon={Store}
          color="amber"
        />
        <StatCard
          title="Customer Couples"
          value={stats?.totalCustomers || 0}
          subtitle="Registered clients"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Total Services"
          value={stats?.totalServices || 0}
          subtitle="Active & pending"
          icon={ShieldCheck}
          color="blue"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingServices || 0}
          subtitle="Requires admin review"
          icon={Clock}
          color="purple"
        />
        <StatCard
          title="Total Transactions"
          value={stats?.totalTransactions || 0}
          subtitle="Verified Stripe payments"
          icon={Receipt}
          color="rose"
        />
      </div>

      {/* Pending Services Action Callout if any */}
      {stats?.pendingServices > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {stats.pendingServices} Service(s) Pending Review
              </h4>
              <p className="text-xs text-amber-700">
                New vendor submissions require moderation before appearing on the public browse directory.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/services?status=pending"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm shrink-0"
          >
            Review Services
          </Link>
        </div>
      )}

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-900">Recent Stripe Transactions</h3>
            <p className="text-xs text-gray-400">Verified platform payments</p>
          </div>
          <Link
            href="/dashboard/admin/transactions"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50/50 text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Vendor</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">
                        {tx.vendorId?.businessName || tx.vendorId?.name || 'Vendor'}
                      </div>
                      <div className="text-[10px] text-gray-400">{tx.vendorId?.email}</div>
                    </td>
                    <td className="py-3 px-4 uppercase font-bold text-amber-700">
                      {tx.plan}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-6 text-center">No transactions recorded yet.</p>
        )}
      </div>
    </div>
  );
}
