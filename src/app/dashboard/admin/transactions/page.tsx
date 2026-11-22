'use client';

import React, { useEffect, useState } from 'react';
import { Transaction } from '@/types';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt, Loader2, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/transactions');
        if (res.success && res.transactions) {
          setTransactions(res.transactions);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch platform transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
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
        <h1 className="font-serif text-3xl font-bold text-gray-900">Platform Transactions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cryptographically verified Stripe subscription charges and vendor membership history.
        </p>
      </div>

      {/* Security Note Banner */}
      <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 flex items-center space-x-3 text-xs text-rose-900">
        <Shield className="w-5 h-5 text-rose-500 shrink-0" />
        <span>
          <strong>Audit Protected:</strong> In compliance with security standards, transaction ledgers are immutable and cannot be edited manually.
        </span>
      </div>

      {/* Transactions Table */}
      {transactions.length > 0 ? (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50/50 text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-4 px-6">Vendor</th>
                  <th className="py-4 px-4">Membership Plan</th>
                  <th className="py-4 px-4">Stripe Session ID</th>
                  <th className="py-4 px-4">Amount Paid</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 text-sm">
                        {tx.vendorId?.businessName || tx.vendorId?.name || 'Vendor'}
                      </div>
                      <div className="text-[11px] text-gray-400">{tx.vendorId?.email}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center text-xs font-bold text-amber-700 uppercase bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        <Sparkles className="w-3 h-3 mr-1 text-amber-500 fill-amber-500" />
                        {tx.plan}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] text-gray-500 truncate max-w-xs">
                      {tx.stripeSessionId}
                    </td>

                    <td className="py-4 px-4 font-bold text-gray-900 text-sm">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        <span>{tx.status}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right text-gray-500 font-medium">
                      {formatDate(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 shadow-sm space-y-2">
          <Receipt className="w-10 h-10 text-rose-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-900">No Transactions Yet</h3>
          <p className="text-xs text-gray-500">
            When vendors upgrade their subscription via Stripe Checkout, verified transaction records will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
