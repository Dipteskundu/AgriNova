import React, { useState, useEffect } from 'react';
import { tr, trPhrase } from "@/lib/localize";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Check,
  X,
  TrendingUp,
  Tag,
  Scale,
  MapPin,
  RefreshCw,
  Microscope,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getMarketplaceListingsAdmin, updateListingStatusAdmin } from '@/lib/adminApi';
import { requestListingInspection } from '@/lib/marketplaceApi';
import { MarketplaceListingAdminView } from '@/types';

export const MarketplaceManagement: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const t = (bn: string, en: string) => (language === 'bn' ? bn : en);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<MarketplaceListingAdminView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListingAdminView | null>(null);
  /** Listing whose inspection request is in flight. */
  const [requestingId, setRequestingId] = useState('');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const res = await getMarketplaceListingsAdmin();
      if (res.success) {
        setListings(res.data);
      }
    } catch {
      showToast('error', tr('Failed to load wholesale marketplace listings'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: MarketplaceListingAdminView['status']) => {
    try {
      const res = await updateListingStatusAdmin(id, status);
      if (res.success) {
        setListings((prev) => prev.map((l) => (l.id === id ? res.data : l)));
        showToast(
          'success',
          language === 'bn'
            ? `তালিকা ${id}-এর অবস্থা ${tr(status)} করা হয়েছে`
            : `Listing ${id} updated to ${status}`
        );
        if (selectedListing?.id === id) {
          setSelectedListing(res.data);
        }
      }
    } catch {
      showToast('error', tr('Failed to update listing status'));
    }
  };

  /**
   * Approval gate (Phase 2) — mirrors `approvalBlockReason` on the server so
   * the button's state and the API's 409 say the same thing. `""` means the
   * server would accept `status: "Approved"`.
   *
   * `"no-report"` — no inspector has submitted a report against this lot.
   * `"rejected"` — a report exists but the inspector graded it Rejected; the
   * remedy is Flag, not publication.
   */
  const approveBlock = (item: MarketplaceListingAdminView): 'no-report' | 'rejected' | '' => {
    if (!item.qualityReport) return 'no-report';
    if (item.qualityGrade === 'Rejected') return 'rejected';
    return '';
  };

  /**
   * Ask an inspector to look at a lot nobody has graded yet. Available to
   * admins as well as sellers because a seeded lot has no owner to raise it
   * from — without this the gate would be a dead end.
   */
  const handleRequestInspection = async (item: MarketplaceListingAdminView) => {
    setRequestingId(item.id);
    const res = await requestListingInspection(item.id);
    setRequestingId('');
    if (res.success) {
      showToast('success', tr('Inspection requested — waiting for an inspector'));
      loadListings();
    } else {
      showToast('error', res.message || tr('Could not request the inspection.'));
    }
  };

  /** The Approve control for one listing, or the reason it is unavailable. */
  const approveControl = (item: MarketplaceListingAdminView, label = tr('Approve')) => {
    if (item.status === 'Approved') return null;

    const block = approveBlock(item);
    if (!block) {
      return (
        <Button
          size="sm"
          variant="primary"
          icon={Check}
          onClick={() => handleStatusChange(item.id, 'Approved')}
        >
          {label}
        </Button>
      );
    }

    if (block === 'rejected') {
      return (
        <span
          title={tr('The inspector graded this lot as Rejected — flag it instead of publishing it.')}
          className="rounded-lg bg-rose-50 px-2 py-1.5 text-[11px] font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
        >
          {tr('Rejected by inspection')}
        </span>
      );
    }

    // No report yet. Either it is already queued, or the admin can queue it.
    if (item.inspectionRequestedAt) {
      return (
        <span
          title={tr('An inspection request is open; the grade and approval unlock when the report lands.')}
          className="rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
        >
          {tr('Inspection queued')}
        </span>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        icon={Microscope}
        disabled={requestingId === item.id}
        onClick={() => handleRequestInspection(item)}
      >
        {requestingId === item.id ? tr('Requesting…') : tr('Request inspection')}
      </Button>
    );
  };

  const statusLabel = (s: MarketplaceListingAdminView['status']) => {
    if (language !== 'bn') return s.toUpperCase();
    switch (s) {
      case 'Approved':
        return 'অনুমোদিত';
      case 'Pending Review':
        return 'পর্যালোচনায় অপেক্ষমাণ';
      case 'Flagged':
        return 'ফ্ল্যাগকৃত';
      case 'Sold Out':
        return 'বিক্রিত';
      default:
        return s;
    }
  };

  const gradeLabel = (g: string) =>
    g === 'Grade A'
      ? t('গ্রেড A', 'Grade A')
      : g === 'Grade B'
        ? t('গ্রেড B', 'Grade B')
        : g === 'Grade C'
          ? t('গ্রেড C', 'Grade C')
          : g === 'Rejected'
            ? t('প্রত্যাখ্যাত', 'Rejected')
            : g;

  const filtered = listings.filter((l) => {
    const matchesSearch =
      l.produceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.locationHub.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalVolumeKg = listings.reduce((acc, l) => acc + l.quantityAvailableKg, 0);
  const approvedCount = listings.filter((l) => l.status === 'Approved').length;
  const pendingCount = listings.filter((l) => l.status === 'Pending Review').length;
  const flaggedCount = listings.filter((l) => l.status === 'Flagged').length;

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
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('National Wholesale Marketplace Supervision')}</h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{tr('Audit farmer bulk crop listings, regulate floor/ceiling price bands, and moderate trade catalogs.')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadListings}>{tr('Sync Market Feeds')}</Button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Total Traded Volume')}</span>
          <span className="text-lg font-black text-slate-900 dark:text-[#f0f0f0]">{(totalVolumeKg / 1000).toFixed(1)}{tr('MT')}</span>
          <span className="text-[10px] text-emerald-600 block">{tr('Across licensed silos')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Approved Listings')}</span>
          <span className="text-lg font-black text-emerald-700">{approvedCount}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('Active on Buyer Board')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Pending Review')}</span>
          <span className="text-lg font-black text-amber-600">{pendingCount}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('Awaiting compliance')}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222]">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Flagged Price Risks')}</span>
          <span className="text-lg font-black text-red-600">{flaggedCount}</span>
          <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0] block">{tr('Out of DAM corridor')}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('Search produce, farmer, cultivar, or hub...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-900 dark:text-[#f0f0f0]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-800 dark:text-[#e0e0e0]"
          >
            <option value="All">{tr('All Listing Statuses')}</option>
            <option value="Approved">{tr('Approved')}</option>
            <option value="Pending Review">{tr('Pending Review')}</option>
            <option value="Flagged">{tr('Flagged')}</option>
            <option value="Sold Out">{tr('Sold Out')}</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isPriceHigh = item.askingPricePerKg > item.suggestedCeilingPrice;
          const isPriceLow = item.askingPricePerKg < item.suggestedFloorPrice;

          return (
            <Card key={item.id} className="hover:border-slate-300 dark:border-[#333333] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-[#f0f0f0]">{trPhrase(item.produceName)}</h3>
                      <Badge
                        variant={
                          item.status === 'Approved'
                            ? 'success'
                            : item.status === 'Flagged'
                            ? 'danger'
                            : item.status === 'Pending Review'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {statusLabel(item.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#a0a0a0]">{tr('Variety:')}{trPhrase(item.variety)}{tr('•')}{trPhrase(item.category)}
                    </p>
                  </div>
                  <Badge variant="neutral">{gradeLabel(item.qualityGrade)}</Badge>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl my-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Available Volume:')}</span>
                    <strong className="text-slate-900 dark:text-[#f0f0f0] font-mono text-sm">
                      {item.quantityAvailableKg.toLocaleString()}{tr('kg (')}{(item.quantityAvailableKg / 1000).toFixed(1)}{tr('MT)')}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Asking Price:')}</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-emerald-700 font-bold text-sm">৳{item.askingPricePerKg.toFixed(1)}{tr('/ kg')}</strong>
                      {isPriceHigh && <span className="text-[10px] text-red-600 font-bold">{language === 'bn' ? `(সর্বোচ্চ সীমার বেশি ৳${item.suggestedCeilingPrice})` : `(Above Ceiling ৳${item.suggestedCeilingPrice})`}</span>}
                      {isPriceLow && <span className="text-[10px] text-amber-600 font-bold">{language === 'bn' ? `(সর্বনিম্ন সীমার কম ৳${item.suggestedFloorPrice})` : `(Below Floor ৳${item.suggestedFloorPrice})`}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-200 dark:border-[#222222]">
                    <span>{tr('Govt Benchmark Band:')}</span>
                    <span>৳{item.suggestedFloorPrice} - ৳{item.suggestedCeilingPrice}{tr('/ kg')}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-[#a0a0a0]">
                  <p>{tr('Seller:')}<strong className="text-slate-800 dark:text-[#e0e0e0]">{item.farmerName}</strong> ({item.farmerPhone})
                  </p>
                  <p className="flex items-center gap-1 text-slate-500 dark:text-[#a0a0a0]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />{tr('Hub:')}{item.locationHub}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">
                <span className="text-[11px] text-slate-400">{tr('Listed:')}{item.listedDate}</span>
                <div className="flex items-center gap-2">
                  {approveControl(item)}
                  {item.status !== 'Flagged' && (
                    <Button
                      size="sm"
                      variant="danger"
                      icon={AlertTriangle}
                      onClick={() => handleStatusChange(item.id, 'Flagged')}
                    >{tr('Flag')}</Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Eye}
                    onClick={() => setSelectedListing(item)}
                  >{tr('Details')}</Button>
                </div>
              </div>

              {item.status !== 'Approved' && approveBlock(item) && (
                <p className="mt-2 text-[11px] text-slate-400">
                  {approveBlock(item) === 'rejected'
                    ? tr('Approve blocked — the inspector graded this lot as Rejected; flag it instead.')
                    : item.inspectionRequestedAt
                      ? tr('Approve blocked — an inspection is queued; approval unlocks when the report lands.')
                      : tr('Approve blocked — this lot has never been inspected.')}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Details Modal */}
      {selectedListing && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedListing(null)}
          title={`${t('তালিকা নিরীক্ষা', 'Listing Audit')} - ${selectedListing.produceName}`}
          subtitle={`${t('আইডি', 'ID')}: ${selectedListing.id} • ${t('পোস্ট করেছেন', 'Posted by')} ${selectedListing.farmerName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Lot Code:')}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-[#e0e0e0]">{selectedListing.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Produce:')}</span>
                <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">{trPhrase(selectedListing.produceName)} ({trPhrase(selectedListing.variety)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Certified Grade:')}</span>
                <span className="font-bold text-emerald-700">{gradeLabel(selectedListing.qualityGrade)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Inspection:')}</span>
                <span
                  className={
                    selectedListing.qualityReport
                      ? 'font-bold text-emerald-700'
                      : 'font-bold text-amber-600'
                  }
                >
                  {!selectedListing.qualityReport
                    ? selectedListing.inspectionRequestedAt
                      ? tr('Requested — awaiting report')
                      : tr('Never inspected')
                    : selectedListing.qualityGrade === 'Rejected'
                      ? tr('Report attached — lot rejected')
                      : tr('Report attached')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Quantity:')}</span>
                <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">{selectedListing.quantityAvailableKg.toLocaleString()}{tr('kg')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Asking Rate:')}</span>
                <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">৳{selectedListing.askingPricePerKg}{tr('/ kg')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#a0a0a0]">{tr('Total Lot Value:')}</span>
                <span className="font-bold text-emerald-800 font-mono">
                  ৳{(selectedListing.quantityAvailableKg * selectedListing.askingPricePerKg).toLocaleString()}{tr('BDT')}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedListing(null)}>{tr('Close')}</Button>
              {approveControl(selectedListing, tr('Approve for Trading'))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
