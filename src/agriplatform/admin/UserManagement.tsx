import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Plus,
  BadgeCheck,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormInput, FormSelect } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getAdminUsers, updateAdminUserStatus } from '@/agriplatform/lib/adminApi';
import { AdminUser } from '@/agriplatform/types';

export const UserManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Farmer' as AdminUser['role'],
    region: 'Rajshahi (Bogura)',
    nationalIdNumber: '',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getAdminUsers();
        if (res.success) {
          setUsers(res.data);
        }
      } catch {
        showToast('error', 'Failed to load user accounts');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus: AdminUser['status'] =
      user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await updateAdminUserStatus(user.id, nextStatus);
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
        showToast('success', `User status updated to ${nextStatus}`);
      }
    } catch {
      showToast('error', 'Failed to update user status');
    }
  };

  const handleToggleVerification = async (user: AdminUser) => {
    try {
      const res = await updateAdminUserStatus(user.id, user.status, !user.verificationBadge);
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
        showToast('success', `Verification badge ${!user.verificationBadge ? 'granted' : 'revoked'}`);
      }
    } catch {
      showToast('error', 'Failed to update verification');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AdminUser = {
      id: `USR-${100 + users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      region: newUser.region,
      status: 'Active',
      registrationDate: new Date().toISOString().split('T')[0],
      verificationBadge: true,
      nationalIdNumber: newUser.nationalIdNumber,
    };
    setUsers([created, ...users]);
    setIsAddModalOpen(false);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'Farmer',
      region: 'Rajshahi (Bogura)',
      nationalIdNumber: '',
    });
    showToast('success', 'New user account registered and verified');
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery) ||
        u.nationalIdNumber.includes(searchQuery);

      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-white rounded-xl border border-slate-200 p-5">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">User Identity & Role Access Governance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Managing {users.length} registered farmers, agronomists, extension officers, and platform operators.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Provision New Account
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, NID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Farmer">Farmers</option>
            <option value="Agronomist">Agronomists</option>
            <option value="Extension Officer">Extension Officers</option>
            <option value="Platform Admin">Platform Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 font-bold text-slate-600 uppercase">User Identity</th>
                <th className="p-4 font-bold text-slate-600 uppercase">Role & Region</th>
                <th className="p-4 font-bold text-slate-600 uppercase">Contact Details</th>
                <th className="p-4 font-bold text-slate-600 uppercase">Verification</th>
                <th className="p-4 font-bold text-slate-600 uppercase">Account Status</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{user.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          NID: {user.nationalIdNumber}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        user.role === 'Platform Admin'
                          ? 'danger'
                          : user.role === 'Agronomist'
                          ? 'info'
                          : user.role === 'Extension Officer'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {user.role}
                    </Badge>
                    <span className="text-[11px] text-slate-500 block mt-1">{user.region}</span>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="w-3 h-3" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleVerification(user)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <Badge variant={user.verificationBadge ? 'success' : 'neutral'}>
                        {user.verificationBadge ? 'Verified DAE' : 'Unverified'}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        user.status === 'Active'
                          ? 'success'
                          : user.status === 'Suspended'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant={user.status === 'Active' ? 'outline' : 'secondary'}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.status === 'Active' ? 'Suspend' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Account Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision Platform User Account"
        subtitle="Create an authorized identity for platform services"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="name"
              label="Full Official Name"
              placeholder="e.g. Dr. Shamsul Huda"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <FormInput
              id="nationalIdNumber"
              label="National ID (NID)"
              placeholder="17-digit or 10-digit smart NID"
              value={newUser.nationalIdNumber}
              onChange={(e) => setNewUser({ ...newUser, nationalIdNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="shamsul@dae.gov.bd"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <FormInput
              id="phone"
              label="Mobile Number"
              placeholder="+880 1712-000000"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              id="role"
              label="Designated Platform Role"
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value as AdminUser['role'] })
              }
              options={[
                { value: 'Farmer', label: 'Farmer (Production)' },
                { value: 'Agronomist', label: 'Agronomist (Advisory)' },
                { value: 'Extension Officer', label: 'Extension Officer (DAE Field Officer)' },
                { value: 'Platform Admin', label: 'Platform Administrator' },
              ]}
            />
            <FormInput
              id="region"
              label="Operating Region / Jurisdiction"
              value={newUser.region}
              onChange={(e) => setNewUser({ ...newUser, region: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
