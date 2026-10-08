import React, { useState, useEffect, useMemo } from 'react';
import { tr } from "@/lib/localize";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormInput, FormSelect } from '@/components/ui/FormInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { createAdminUser, getAdminUsers, updateAdminUserStatus } from '@/lib/adminApi';
import { AdminUser } from '@/types';

export const UserManagement: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const t = (bn: string, en: string) => (language === 'bn' ? bn : en);

  const roleLabel = (r: AdminUser['role']) => {
    switch (r) {
      case 'Farmer':
        return t('কৃষক', 'Farmer');
      case 'Agronomist':
        return t('কৃষি বিজ্ঞানী', 'Agronomist');
      case 'Extension Officer':
        return t('এক্সটেনশন কর্মকর্তা', 'Extension Officer');
      case 'Platform Admin':
        return t('প্ল্যাটফর্ম অ্যাডমিন', 'Platform Admin');
      default:
        return r;
    }
  };

  const statusLabel = (s: AdminUser['status']) => {
    switch (s) {
      case 'Active':
        return t('সক্রিয়', 'Active');
      case 'Pending Verification':
        return t('যাচাইয়ের অপেক্ষায়', 'Pending Verification');
      case 'Suspended':
        return t('স্থগিত', 'Suspended');
      default:
        return s;
    }
  };
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
        showToast('error', t('ব্যবহারকারী অ্যাকাউন্ট লোড করা যায়নি', 'Failed to load user accounts'));
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
        showToast(
          'success',
          language === 'bn'
            ? `ব্যবহারকারীর অবস্থা ${tr(nextStatus)} করা হয়েছে`
            : `User status updated to ${nextStatus}`
        );
      }
    } catch {
      showToast('error', t('ব্যবহারকারীর অবস্থা আপডেট করা যায়নি', 'Failed to update user status'));
    }
  };

  const handleToggleVerification = async (user: AdminUser) => {
    try {
      const res = await updateAdminUserStatus(user.id, user.status, !user.verificationBadge);
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
        showToast(
          'success',
          language === 'bn'
            ? `যাচাইকরণ ব্যাজ ${!user.verificationBadge ? 'প্রদান' : 'প্রত্যাহার'} করা হয়েছে`
            : `Verification badge ${!user.verificationBadge ? 'granted' : 'revoked'}`
        );
      }
    } catch {
      showToast('error', t('যাচাইকরণ আপডেট করা যায়নি', 'Failed to update verification'));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createAdminUser({
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        region: newUser.region,
        nationalIdNumber: newUser.nationalIdNumber,
      });
      if (res.success) {
        setUsers([res.data, ...users]);
        setIsAddModalOpen(false);
        setNewUser({
          name: '',
          email: '',
          phone: '',
          role: 'Farmer',
          region: 'Rajshahi (Bogura)',
          nationalIdNumber: '',
        });
        showToast('success', t('নতুন ব্যবহারকারী অ্যাকাউন্ট নিবন্ধিত ও যাচাই করা হয়েছে', 'New user account registered and verified'));
      }
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : t('ব্যবহারকারী অ্যাকাউন্ট তৈরি করা যায়নি', 'Failed to create user account'));
    }
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
        <div className="h-64 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222] p-5">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{t('ইউজার পরিচয় ও ভূমিকা অ্যাক্সেস শাসন', 'User Identity & Role Access Governance')}</h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{t('ব্যবস্থাপনাধীন: ', 'Managing: ')}{users.length}{t(' জন নিবন্ধিত কৃষক, কৃষিবিদ, এক্সটেনশন অফিসার ও প্ল্যাটফর্ম অপারেটর।', ' registered farmers, agronomists, extension officers, and platform operators.')}</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >{t('নতুন অ্যাকাউন্ট প্রদান', 'Provision New Account')}</Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('নাম, ইমেইল, NID বা ফোন দিয়ে খুঁজুন...', 'Search by name, email, NID, or phone...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-[#f0f0f0] placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-800 dark:text-[#e0e0e0] focus:outline-none"
          >
            <option value="All">{t('সব ভূমিকা', 'All Roles')}</option>
            <option value="Farmer">{t('কৃষক', 'Farmers')}</option>
            <option value="Agronomist">{t('কৃষিবিদ', 'Agronomists')}</option>
            <option value="Extension Officer">{t('এক্সটেনশন অফিসার', 'Extension Officers')}</option>
            <option value="Platform Admin">{t('প্ল্যাটফর্ম অ্যাডমিনরা', 'Platform Admins')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-800 dark:text-[#e0e0e0] focus:outline-none"
          >
            <option value="All">{t('সব অবস্থা', 'All Statuses')}</option>
            <option value="Active">{t('সক্রিয়', 'Active')}</option>
            <option value="Pending Verification">{t('যাচাইয়ের অপেক্ষায়', 'Pending Verification')}</option>
            <option value="Suspended">{t('স্থগিত', 'Suspended')}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#222222] bg-slate-50 dark:bg-[#111111]/60/80">
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{t('ইউজার পরিচয়', 'User Identity')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{t('ভূমিকা ও অঞ্চল', 'Role & Region')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{t('যোগাযোগের তথ্য', 'Contact Details')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{t('যাচাইকরণ', 'Verification')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase">{t('অ্যাকাউন্টের অবস্থা', 'Account Status')}</th>
                <th className="p-4 font-bold text-slate-600 dark:text-[#a0a0a0] uppercase text-right">{t('কর্ম', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/60 dark:bg-[#111111]/60/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-[#f0f0f0] block">{user.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{t('NID:', 'NID:')}{user.nationalIdNumber}
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
                      {roleLabel(user.role)}
                    </Badge>
                    <span className="text-[11px] text-slate-500 dark:text-[#a0a0a0] block mt-1">{user.region}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-[#a0a0a0]">
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
                        {user.verificationBadge
                          ? t('যাচাইকৃত DAE', 'Verified DAE')
                          : t('অযাচাইকৃত', 'Unverified')}
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
                      {statusLabel(user.status)}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant={user.status === 'Active' ? 'outline' : 'secondary'}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.status === 'Active'
                        ? t('স্থগিত করুন', 'Suspend')
                        : t('সক্রিয় করুন', 'Activate')}
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
        title={t('প্ল্যাটফর্ম ইউজার অ্যাকাউন্ট প্রদান', 'Provision Platform User Account')}
        subtitle={t('প্ল্যাটফর্ম সেবার জন্য অনুমোদিত পরিচয় তৈরি করুন', 'Create an authorized identity for platform services')}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              id="name"
              label={t('সম্পূর্ণ দাপ্তরিক নাম', 'Full Official Name')}
              placeholder={t('যেমন: ড. শামসুল হুদা', 'e.g. Dr. Shamsul Huda')}
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <FormInput
              id="nationalIdNumber"
              label={t('জাতীয় পরিচয়পত্র (NID)', 'National ID (NID)')}
              placeholder={t('১৭-অঙ্ক বা ১০-অঙ্কের স্মার্ট NID', '17-digit or 10-digit smart NID')}
              value={newUser.nationalIdNumber}
              onChange={(e) => setNewUser({ ...newUser, nationalIdNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              id="email"
              label={t('ইমেইল ঠিকানা', 'Email Address')}
              type="email"
              placeholder={tr('shamsul@dae.gov.bd')}
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <FormInput
              id="phone"
              label={t('মোবাইল নম্বর', 'Mobile Number')}
              placeholder="+880 1712-000000"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormSelect
              id="role"
              label={t('নির্ধারিত প্ল্যাটফর্ম ভূমিকা', 'Designated Platform Role')}
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value as AdminUser['role'] })
              }
              options={[
                { value: 'Farmer', label: t('কৃষক (উৎপাদন)', 'Farmer (Production)') },
                { value: 'Agronomist', label: t('কৃষিবিদ (পরামর্শ)', 'Agronomist (Advisory)') },
                { value: 'Extension Officer', label: t('এক্সটেনশন অফিসার (DAE ফিল্ড অফিসার)', 'Extension Officer (DAE Field Officer)') },
                { value: 'Platform Admin', label: t('প্ল্যাটফর্ম প্রশাসক', 'Platform Administrator') },
              ]}
            />
            <FormInput
              id="region"
              label={t('পরিচালন অঞ্চল / এখতিয়ার', 'Operating Region / Jurisdiction')}
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
            >{t('বাতিল', 'Cancel')}</Button>
            <Button type="submit" variant="primary" size="sm">{t('অ্যাকাউন্ট তৈরি', 'Create Account')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
