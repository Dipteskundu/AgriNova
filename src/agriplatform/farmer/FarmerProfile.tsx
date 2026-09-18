import React, { useState, useEffect } from 'react';
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
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormInput } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getFarmerProfile, updateFarmerProfile } from '@/agriplatform/lib/farmerApi';
import { FarmerProfile as FarmerProfileType } from '@/agriplatform/types';

export const FarmerProfile: React.FC = () => {
  const { showToast } = useToast();
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
        showToast('error', 'Failed to fetch farmer profile');
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
        showToast('success', 'Profile updated successfully');
      }
    } catch {
      showToast('error', 'Failed to update profile');
    }
  };

  if (loading || !profile) {
    return (
      <div className="space-y-4">
        <div className="h-44 bg-white rounded-xl border border-slate-200 p-6">
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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl border-2 border-emerald-500/20 shadow-xs">
            MK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
              <Badge variant="success">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified Farmer
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Farmer ID: <span className="font-mono font-medium text-slate-700">{profile.id}</span> • NID: {profile.nationalId}
            </p>
            <p className="text-xs text-slate-500">
              Affiliated Club: <span className="text-emerald-700 font-semibold">{profile.farmerClub}</span>
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Edit}
          onClick={() => setIsEditModalOpen(true)}
        >
          Edit Profile Information
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Demographics */}
        <Card>
          <CardHeader title="Contact & Primary Demographics" />
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Phone Number</p>
                <p className="text-slate-800 font-semibold">{profile.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Govt Agri Email</p>
                <p className="text-slate-800 font-semibold">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Experience & Registered Since</p>
                <p className="text-slate-800 font-semibold">
                  {profile.farmingExperienceYears} Years in Agronomy • Member since {profile.registeredSince}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Home Location & Coordinates</p>
                <p className="text-slate-800 font-semibold">
                  {profile.primaryLocation.village}, {profile.primaryLocation.upazila}, {profile.primaryLocation.district} ({profile.primaryLocation.division})
                </p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  GPS: {profile.primaryLocation.coordinates.lat}° N, {profile.primaryLocation.coordinates.lng}° E
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Bank & Payout Escrow Details */}
        <Card>
          <CardHeader
            title="Banking & Marketplace Payout Account"
            subtitle="Automated disbursement channel for wholesale grain payouts"
          />
          <div className="space-y-3.5 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <div className="flex items-center gap-2 mb-2">
                <Landmark className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-900 text-sm">{profile.bankDetails.bankName}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Account Name</span>
                  <p className="font-semibold text-slate-800">{profile.bankDetails.accountName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Account Number</span>
                  <p className="font-mono font-semibold text-slate-900">{profile.bankDetails.accountNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Branch</span>
                  <p className="font-semibold text-slate-800">{profile.bankDetails.branchName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Routing Number</span>
                  <p className="font-mono font-semibold text-slate-900">{profile.bankDetails.routingNumber}</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Mobile Wallet Instant Backup</p>
                <p className="text-[11px] text-slate-500">Linked to personal bKash/Nagad merchant ID</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Certifications & Badges */}
      <Card>
        <CardHeader
          title="Agricultural Certifications & DAE Accreditations"
          subtitle="Government and international agricultural research institute recognitions"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.certifications.map((cert, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                    <Award className="w-5 h-5" />
                  </div>
                  <Badge variant="success">Verified</Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{cert.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{cert.issuingAuthority}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Accredited Year</span>
                <span className="font-bold text-slate-700">{cert.issuedYear}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Farmer Profile Information"
        subtitle="Update personal, agronomic, and settlement details"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormInput
            id="fullName"
            label="Full Name"
            value={editForm.fullName}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="phoneNumber"
              label="Phone Number"
              value={editForm.phoneNumber}
              onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              required
            />
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </div>
          <FormInput
            id="experience"
            label="Farming Experience (Years)"
            type="number"
            value={editForm.farmingExperienceYears}
            onChange={(e) => setEditForm({ ...editForm, farmingExperienceYears: Number(e.target.value) })}
            required
          />

          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Bank Settlement Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                id="bankName"
                label="Bank Name"
                value={editForm.bankName}
                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                required
              />
              <FormInput
                id="accountNumber"
                label="Account Number"
                value={editForm.accountNumber}
                onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                required
              />
              <FormInput
                id="branchName"
                label="Branch"
                value={editForm.branchName}
                onChange={(e) => setEditForm({ ...editForm, branchName: e.target.value })}
                required
              />
              <FormInput
                id="routingNumber"
                label="Routing Number"
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
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
