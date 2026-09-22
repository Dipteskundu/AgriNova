import React, { useState, useEffect } from 'react';
import { tr } from "@/lib/localize";
import {
  User,
  MapPin,
  Landmark,
  Award,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Edit,
  Save,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormInput } from '@/components/ui/FormInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getFarmerProfile, updateFarmerProfile } from '@/lib/farmerApi';
import { FarmerProfile as FarmerProfileType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

export const FarmerProfile: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FarmerProfileType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    farmingExperienceYears: 18,
    bankName: '',
    accountNumber: '',
    branchName: '',
    routingNumber: '',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getFarmerProfile();
        if (res.success) {
          setProfile(res.data);
          setEditForm({
            fullName: res.data.fullName,
            phoneNumber: res.data.phoneNumber,
            email: res.data.email,
            farmingExperienceYears: res.data.farmingExperienceYears,
            bankName: res.data.bankDetails.bankName,
            accountNumber: res.data.bankDetails.accountNumber,
            branchName: res.data.bankDetails.branchName,
            routingNumber: res.data.bankDetails.routingNumber,
          });
        }
      } catch {
        showToast('error', tr('Failed to fetch farmer profile'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const res = await updateFarmerProfile({
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        email: editForm.email,
        farmingExperienceYears: Number(editForm.farmingExperienceYears),
        bankDetails: {
          ...profile.bankDetails,
          bankName: editForm.bankName,
          accountNumber: editForm.accountNumber,
          branchName: editForm.branchName,
          routingNumber: editForm.routingNumber,
        },
      });
      if (res.success) {
        setProfile(res.data);
        setIsEditModalOpen(false);
        showToast('success', tr('Profile updated successfully'));
      }
    } catch {
      showToast('error', tr('Failed to update profile'));
    }
  };

  if (loading || !profile) {
    return (
      <div className="space-y-4">
        <div className="h-44 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222] p-6">
          <Skeleton className="h-6 w-48 mb-3" />
          <Skeleton className="h-4 w-72 mb-2" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222222]/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl border-2 border-emerald-500/20 shadow-xs">{tr('MK')}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">{profile.fullName}</h2>
              <Badge variant="success">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                {language === 'bn' ? 'যাচাইকৃত কৃষক' : 'Verified Farmer'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-1">
              {language === 'bn' ? 'কৃষক আইডি: ' : 'Farmer ID: '}
              <span className="font-mono font-medium text-slate-700 dark:text-[#999999]">{profile.id}</span>{tr('•')}{language === 'bn' ? 'জাতীয় পরিচয়পত্র: ' : 'NID: '}
              {profile.nationalId}
            </p>
            <p className="text-xs text-slate-500 dark:text-[#a0a0a0]">
              {language === 'bn' ? 'সংযুক্ত কৃষক ক্লাব: ' : 'Affiliated Club: '}
              <span className="text-emerald-700 font-semibold">{tr(profile.farmerClub)}</span>
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Edit}
          onClick={() => setIsEditModalOpen(true)}
        >
          {language === 'bn' ? 'প্রোফাইল তথ্য সংশোধন' : 'Edit Profile Information'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Demographics */}
        <Card>
          <CardHeader
            title={language === 'bn' ? 'যোগাযোগ ও ব্যক্তিগত তথ্য' : 'Contact & Primary Demographics'}
          />
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111111]/60 border border-slate-100">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                </p>
                <p className="text-slate-800 dark:text-[#e0e0e0] font-semibold">{profile.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111111]/60 border border-slate-100">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'সরকারি কৃষি ইমেইল' : 'Govt Agri Email'}
                </p>
                <p className="text-slate-800 dark:text-[#e0e0e0] font-semibold">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111111]/60 border border-slate-100">
              <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'কৃষি অভিজ্ঞতা ও নিবন্ধনের মেয়াদ' : 'Experience & Registered Since'}
                </p>
                <p className="text-slate-800 dark:text-[#e0e0e0] font-semibold">
                  {language === 'bn'
                    ? `${profile.farmingExperienceYears} বছর কৃষিকাজে যুক্ত • সদস্য সাল: ${profile.registeredSince}`
                    : `${profile.farmingExperienceYears} Years in Agronomy • Member since ${profile.registeredSince}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111111]/60 border border-slate-100">
              <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn' ? 'খামারের স্থায়ী ঠিকানা' : 'Home Location & Coordinates'}
                </p>
                <p className="text-slate-800 dark:text-[#e0e0e0] font-semibold">
                  {tr(profile.primaryLocation.village)}, {tr(profile.primaryLocation.upazila)}, {tr(profile.primaryLocation.district)} ({tr(profile.primaryLocation.division)})
                </p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{tr('GPS:')}{profile.primaryLocation.coordinates.lat}° N, {profile.primaryLocation.coordinates.lng}° E
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Bank & Payout Escrow Details */}
        <Card>
          <CardHeader
            title={language === 'bn' ? 'ব্যাংক ও পেমেন্ট অ্যাকাউন্ট' : 'Banking & Marketplace Payout Account'}
            subtitle={language === 'bn' ? 'ফসল বিক্রয়লব্ধ টাকা সরাসরি জমা হওয়ার ব্যাংক হিসাব' : 'Automated disbursement channel for wholesale grain payouts'}
          />
          <div className="space-y-3.5 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <div className="flex items-center gap-2 mb-2">
                <Landmark className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-900 text-sm">{profile.bankDetails.bankName}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] uppercase tracking-wider">
                    {language === 'bn' ? 'হিসাবধারীর নাম' : 'Account Name'}
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-[#e0e0e0]">{profile.bankDetails.accountName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] uppercase tracking-wider">
                    {language === 'bn' ? 'হিসাব নম্বর' : 'Account Number'}
                  </span>
                  <p className="font-mono font-semibold text-slate-900 dark:text-[#f0f0f0]">{profile.bankDetails.accountNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] uppercase tracking-wider">
                    {language === 'bn' ? 'শাখা' : 'Branch'}
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-[#e0e0e0]">{profile.bankDetails.branchName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] uppercase tracking-wider">
                    {language === 'bn' ? 'রাউটিং নম্বর' : 'Routing Number'}
                  </span>
                  <p className="font-mono font-semibold text-slate-900 dark:text-[#f0f0f0]">{profile.bankDetails.routingNumber}</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111111]/60 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-[#e0e0e0]">
                  {language === 'bn' ? 'মোবাইল ওয়ালেট ব্যাকআপ' : 'Mobile Wallet Instant Backup'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0]">
                  {language === 'bn' ? 'বিকাশ ও নগদ সংযুক্ত' : 'Linked to personal bKash/Nagad merchant ID'}
                </p>
              </div>
              <Badge variant="success">{language === 'bn' ? 'সক্রিয়' : 'Active'}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Certifications & Badges */}
      <Card>
        <CardHeader
          title={language === 'bn' ? 'কৃষি সনদ ও সরকারি স্বীকৃতি' : 'Agricultural Certifications & DAE Accreditations'}
          subtitle={language === 'bn' ? 'কৃষি সম্প্রসারণ অধিদপ্তর ও জাতীয় গবেষণা প্রতিষ্ঠানের স্বীকৃতি' : 'Government and international agricultural research institute recognitions'}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.certifications.map((cert, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-slate-200 dark:border-[#222222] bg-white dark:bg-[#0a0a0a] hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                    <Award className="w-5 h-5" />
                  </div>
                  <Badge variant="success">{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-[#f0f0f0]">{tr(cert.name)}</h4>
                <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0] mt-1">{tr(cert.issuingAuthority)}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{language === 'bn' ? 'প্রাপ্তির বছর' : 'Accredited Year'}</span>
                <span className="font-bold text-slate-700 dark:text-[#999999]">{cert.issuedYear}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={language === 'bn' ? 'কৃষক প্রোফাইল তথ্য সংশোধন' : 'Edit Farmer Profile Information'}
        subtitle={language === 'bn' ? 'ব্যক্তিগত তথ্য, অভিজ্ঞতা ও ব্যাংক হিসাব হালনাগাদ করুন' : 'Update personal, agronomic, and settlement details'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormInput
            id="fullName"
            label={language === 'bn' ? 'সম্পূর্ণ নাম' : 'Full Name'}
            value={editForm.fullName}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              id="phoneNumber"
              label={language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
              value={editForm.phoneNumber}
              onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              required
            />
            <FormInput
              id="email"
              label={language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </div>
          <FormInput
            id="experience"
            label={language === 'bn' ? 'কৃষি কাজের অভিজ্ঞতা (বছর)' : 'Farming Experience (Years)'}
            type="number"
            value={editForm.farmingExperienceYears}
            onChange={(e) => setEditForm({ ...editForm, farmingExperienceYears: Number(e.target.value) })}
            required
          />

          <div className="pt-3 border-t border-slate-200 dark:border-[#222222]">
            <h4 className="text-xs font-bold text-slate-800 dark:text-[#e0e0e0] uppercase tracking-wider mb-2">
              {language === 'bn' ? 'ব্যাংক লেনদেন তথ্য' : 'Bank Settlement Details'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                id="bankName"
                label={language === 'bn' ? 'ব্যাংকের নাম' : 'Bank Name'}
                value={editForm.bankName}
                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                required
              />
              <FormInput
                id="accountNumber"
                label={language === 'bn' ? 'অ্যাকাউন্ট নম্বর' : 'Account Number'}
                value={editForm.accountNumber}
                onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                required
              />
              <FormInput
                id="branchName"
                label={language === 'bn' ? 'শাখা' : 'Branch'}
                value={editForm.branchName}
                onChange={(e) => setEditForm({ ...editForm, branchName: e.target.value })}
                required
              />
              <FormInput
                id="routingNumber"
                label={language === 'bn' ? 'রাউটিং নম্বর' : 'Routing Number'}
                value={editForm.routingNumber}
                onChange={(e) => setEditForm({ ...editForm, routingNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
