'use client';

import React, { useEffect, useState } from 'react';
import { User, UserRole } from '@/types';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  X,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch registered users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleBlock = async (userId: string) => {
    try {
      setBlockingId(userId);
      const res = await api.patch(`/admin/users/${userId}/block`);
      if (res.success) {
        toast.success(res.message);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isBlocked: res.isBlocked } : u))
        );
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, isBlocked: res.isBlocked });
        }
      } else {
        toast.error(res.message || 'Failed to update user block status.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating user block status.');
    } finally {
      setBlockingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review registered customers and vendors, inspect profiles, and manage access permissions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by name, email, or studio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {['all', 'customer', 'vendor', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                roleFilter === role
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-rose-50'
              }`}
            >
              {role === 'all' ? 'All Roles' : `${role}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : users.length > 0 ? (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50/50 text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Subscription</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((userItem) => {
                  const isBlocked = userItem.isBlocked;
                  const isVendor = userItem.role === 'vendor';
                  const isUserBusy = blockingId === userItem._id;

                  return (
                    <tr key={userItem._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              userItem.image ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
                            }
                            alt={userItem.name}
                            className="w-9 h-9 rounded-full object-cover border border-rose-200"
                          />
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {userItem.name}
                            </div>
                            <div className="text-gray-400 text-[11px]">{userItem.email}</div>
                            {isVendor && userItem.businessName && (
                              <div className="text-[10px] text-rose-600 font-medium">
                                Studio: {userItem.businessName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="capitalize font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md text-[11px]">
                          {userItem.role}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isBlocked
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {isVendor ? (
                          <span
                            className={`inline-flex items-center text-[11px] font-semibold uppercase ${
                              userItem.subscriptionPlan === 'premium'
                                ? 'text-amber-700 font-bold'
                                : 'text-gray-500'
                            }`}
                          >
                            {userItem.subscriptionPlan === 'premium' && (
                              <Sparkles className="w-3 h-3 mr-1 text-amber-500 fill-amber-500" />
                            )}
                            {userItem.subscriptionPlan}
                          </span>
                        ) : (
                          <span className="text-gray-400">&mdash;</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-gray-500">{formatDate(userItem.createdAt)}</td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedUser(userItem)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-rose-600 hover:bg-rose-50 border border-gray-200"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {userItem.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleBlock(userItem._id!)}
                              disabled={isUserBusy}
                              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 ${
                                isBlocked
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                  : 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                              }`}
                              title={isBlocked ? 'Unblock User' : 'Block User'}
                            >
                              {isUserBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isBlocked ? (
                                <Unlock className="w-3.5 h-3.5" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 shadow-sm space-y-2">
          <Users className="w-10 h-10 text-rose-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-900">No Users Found</h3>
          <p className="text-xs text-gray-500">Try modifying your role filter or search keyword.</p>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4">
              <img
                src={
                  selectedUser.image ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={selectedUser.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-200"
              />
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  {selectedUser.role} Account
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs divide-y divide-gray-100">
              <div className="pt-2 flex justify-between">
                <span className="text-gray-500">Email Address</span>
                <span className="font-medium text-gray-900">{selectedUser.email}</span>
              </div>

              {selectedUser.businessName && (
                <div className="pt-2 flex justify-between">
                  <span className="text-gray-500">Studio Name</span>
                  <span className="font-medium text-gray-900">{selectedUser.businessName}</span>
                </div>
              )}

              {selectedUser.phone && (
                <div className="pt-2 flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-900">{selectedUser.phone}</span>
                </div>
              )}

              <div className="pt-2 flex justify-between">
                <span className="text-gray-500">Access Status</span>
                <span
                  className={`font-bold uppercase ${
                    selectedUser.isBlocked ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {selectedUser.isBlocked ? 'Suspended / Blocked' : 'Active Account'}
                </span>
              </div>

              {selectedUser.role === 'vendor' && (
                <div className="pt-2 flex justify-between">
                  <span className="text-gray-500">Subscription Tier</span>
                  <span className="font-bold text-amber-700 uppercase">
                    {selectedUser.subscriptionPlan}
                  </span>
                </div>
              )}

              {selectedUser.bio && (
                <div className="pt-3 space-y-1">
                  <span className="text-gray-500 block">Bio / Notes:</span>
                  <p className="bg-gray-50 p-2.5 rounded-xl text-gray-700 italic">
                    {selectedUser.bio}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center">
              {selectedUser.role !== 'admin' && (
                <button
                  onClick={() => handleToggleBlock(selectedUser._id!)}
                  disabled={blockingId === selectedUser._id}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    selectedUser.isBlocked
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                >
                  {selectedUser.isBlocked ? 'Unblock Account' : 'Block User Account'}
                </button>
              )}
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
