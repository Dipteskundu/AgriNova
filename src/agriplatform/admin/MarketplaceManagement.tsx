import React, { useState, useEffect } from 'react';
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
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getMarketplaceListingsAdmin, updateListingStatusAdmin } from '@/agriplatform/lib/adminApi';
import { MarketplaceListingAdminView } from '@/agriplatform/types';

export const MarketplaceManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<MarketplaceListingAdminView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListingAdminView | null>(null);

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
      showToast('error', 'Failed to load wholesale marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: MarketplaceListingAdminView['status']) => {
    try {
      const res = await updateListingStatusAdmin(id, status);
      if (res.success) {
        setListings((prev) => prev.map((l) => (l.id === id ? res.data : l)));
        showToast('success', `Listing ${id} updated to ${status}`);
        if (selectedListing?.id === id) {
          setSelectedListing(res.data);
        }
      }
    } catch {
      showToast('error', 'Failed to update listing status');
    }
  };

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
          <h2 className="text-lg font-bold text-slate-900">National Wholesale Marketplace Supervision</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit farmer bulk crop listings, regulate floor/ceiling price bands, and moderate trade catalogs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadListings}>
            Sync Market Feeds
          </Button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Traded Volume</span>
          <span className="text-lg font-black text-slate-900">{(totalVolumeKg / 1000).toFixed(1)} MT</span>
          <span className="text-[10px] text-emerald-600 block">Across licensed silos</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Approved Listings</span>
          <span className="text-lg font-black text-emerald-700">{approvedCount}</span>
          <span className="text-[10px] text-slate-500 block">Active on Buyer Board</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Pending Review</span>
          <span className="text-lg font-black text-amber-600">{pendingCount}</span>
          <span className="text-[10px] text-slate-500 block">Awaiting compliance</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Flagged Price Risks</span>
          <span className="text-lg font-black text-red-600">{flaggedCount}</span>
          <span className="text-[10px] text-slate-500 block">Out of DAM corridor</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search produce, farmer, cultivar, or hub..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          >
            <option value="All">All Listing Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Flagged">Flagged</option>
            <option value="Sold Out">Sold Out</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isPriceHigh = item.askingPricePerKg > item.suggestedCeilingPrice;
          const isPriceLow = item.askingPricePerKg < item.suggestedFloorPrice;

          return (
            <Card key={item.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{item.produceName}</h3>
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
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Variety: {item.variety} • {item.category}
                    </p>
                  </div>
                  <Badge variant="neutral">{item.qualityGrade}</Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl my-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Available Volume:</span>
                    <strong className="text-slate-900 font-mono text-sm">
                      {item.quantityAvailableKg.toLocaleString()} kg ({(item.quantityAvailableKg / 1000).toFixed(1)} MT)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Asking Price:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-emerald-700 font-bold text-sm">৳{item.askingPricePerKg.toFixed(1)} / kg</strong>
                      {isPriceHigh && <span className="text-[10px] text-red-600 font-bold">(Above Ceiling ৳{item.suggestedCeilingPrice})</span>}
                      {isPriceLow && <span className="text-[10px] text-amber-600 font-bold">(Below Floor ৳{item.suggestedFloorPrice})</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-200">
                    <span>Govt Benchmark Band:</span>
                    <span>৳{item.suggestedFloorPrice} - ৳{item.suggestedCeilingPrice} / kg</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p>
                    Seller: <strong className="text-slate-800">{item.farmerName}</strong> ({item.farmerPhone})
                  </p>
                  <p className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Hub: {item.locationHub}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">
                <span className="text-[11px] text-slate-400">Listed: {item.listedDate}</span>
                <div className="flex items-center gap-2">
                  {item.status !== 'Approved' && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Check}
                      onClick={() => handleStatusChange(item.id, 'Approved')}
                    >
                      Approve
                    </Button>
                  )}
                  {item.status !== 'Flagged' && (
                    <Button
                      size="sm"
                      variant="danger"
                      icon={AlertTriangle}
                      onClick={() => handleStatusChange(item.id, 'Flagged')}
                    >
                      Flag
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Eye}
                    onClick={() => setSelectedListing(item)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Details Modal */}
      {selectedListing && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedListing(null)}
          title={`Listing Audit - ${selectedListing.produceName}`}
          subtitle={`ID: ${selectedListing.id} • Posted by ${selectedListing.farmerName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Lot Code:</span>
                <span className="font-mono font-bold text-slate-800">{selectedListing.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Produce:</span>
                <span className="font-bold text-slate-800">{selectedListing.produceName} ({selectedListing.variety})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Certified Grade:</span>
                <span className="font-bold text-emerald-700">{selectedListing.qualityGrade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-bold text-slate-800">{selectedListing.quantityAvailableKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Asking Rate:</span>
                <span className="font-bold text-slate-800">৳{selectedListing.askingPricePerKg} / kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Lot Value:</span>
                <span className="font-bold text-emerald-800 font-mono">
                  ৳{(selectedListing.quantityAvailableKg * selectedListing.askingPricePerKg).toLocaleString()} BDT
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedListing(null)}>
                Close
              </Button>
              {selectedListing.status !== 'Approved' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStatusChange(selectedListing.id, 'Approved')}
                >
                  Approve for Trading
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
