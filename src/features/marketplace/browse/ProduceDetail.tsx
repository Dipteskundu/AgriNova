"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getProduceById,
  addToCart,
  type ProduceListing,
  type QualityGrade,
} from "@/lib/marketplaceApi";

interface Props {
  id: string;
  /**
   * Breadcrumb/root path. Matches wherever the detail page was mounted —
   * `/products` for the public route. Detail is session-gated by the route
   * itself, so this component only ever runs for a signed-in visitor.
   */
  basePath?: string;
}

export function ProduceDetail({ id, basePath = "/products" }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();

  const [listing, setListing] = useState<ProduceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const t = (bn: string, en: string) => language === "bn" ? bn : en;

  useEffect(() => {
    getProduceById(id).then((res) => {
      if (res.success && res.data) {
        setListing(res.data);
        setQuantity(res.data.minimumOrderKg);
      }
      setLoading(false);
    });
  }, [id]);

  /** Send them through login and bring them back here afterwards. */
  const requireLogin = () => {
    router.push(`/login?next=${encodeURIComponent(`${basePath}/${id}`)}`);
  };

  const handleAddToCart = () => {
    if (!user) {
      requireLogin();
      return;
    }
    if (!listing) return;
    if (quantity < listing.minimumOrderKg) {
      showToast("error", `Minimum order is ${listing.minimumOrderKg} kg`);
      return;
    }
    setAddingToCart(true);
    addToCart(listing, quantity);
    showToast("success", `${listing.cropName} added to cart (${quantity} kg)`);
    setAddingToCart(false);
  };

  const gradeColor: Record<QualityGrade, "success" | "warning" | "neutral"> = {
    "Grade A": "success",
    "Grade B": "warning",
    "Grade C": "neutral",
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-[#1a1a1a] rounded w-1/3 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-slate-200 dark:bg-[#1a1a1a] rounded-2xl" />
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-5 bg-slate-200 dark:bg-[#1a1a1a] rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">Listing not found.</p>
        <Link href={basePath} className="mt-4 inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
          <Icon name="ArrowLeft" size={14} /> Back to Products
        </Link>
      </div>
    );
  }

  const totalCost = quantity * listing.pricePerKgBdt;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href={basePath} className="hover:text-blue-600">
          {t("পণ্য", "Products")}
        </Link>
        <Icon name="ChevronRight" size={12} />
        <span className="text-slate-700 dark:text-[#e0e0e0] font-medium">{listing.cropName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80">
            <img src={listing.imageUrl} alt={listing.cropName} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant={gradeColor[listing.qualityGrade]}>{listing.qualityGrade}</Badge>
              {listing.isVerified && (
                <span className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  <Icon name="ShieldCheck" size={11} /> Verified
                </span>
              )}
            </div>
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {listing.tags.map(tag => (
              <span key={tag} className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-[#a0a0a0] rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Info + Order */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0]">{listing.cropName}</h1>
            <p className="text-slate-500 dark:text-[#a0a0a0] text-sm mt-1">{listing.variety} · {listing.category}</p>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">৳{listing.pricePerKgBdt}</span>
              <span className="text-sm text-slate-400">/kg</span>
            </div>
          </div>

          {/* Farmer info */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                {listing.farmerAvatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0]">{listing.farmerName}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Icon name="MapPin" size={11} /> {listing.farmerLocation}
                </p>
              </div>
              <a href={`tel:${listing.farmerPhone}`} className="ml-auto flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                <Icon name="Phone" size={13} /> Contact
              </a>
            </div>
          </Card>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "PackageCheck", label: "Available", value: `${listing.quantityKg.toLocaleString()} kg` },
              { icon: "ShoppingCart", label: "Min. Order", value: `${listing.minimumOrderKg} kg` },
              { icon: "Calendar", label: "Harvested", value: listing.harvestDate },
              { icon: "Clock", label: "Available Until", value: listing.availableUntil },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2 bg-slate-50 dark:bg-[#0f0f0f] rounded-xl p-3">
                <Icon name={item.icon as any} size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{item.label}</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-[#e0e0e0] mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-[#a0a0a0] leading-relaxed">{listing.description}</p>

          {/* Order widget */}
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-500/20">
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#e0e0e0] mb-2">
              Quantity (kg) — Min: {listing.minimumOrderKg} kg
            </label>
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setQuantity(q => Math.max(listing.minimumOrderKg, q - listing.minimumOrderKg))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#333] bg-white dark:bg-[#111] flex items-center justify-center text-slate-700 dark:text-[#e0e0e0] hover:bg-slate-50 transition-colors"
              >
                <Icon name="Minus" size={14} />
              </button>
              <input
                type="number"
                min={listing.minimumOrderKg}
                max={listing.quantityKg}
                step={listing.minimumOrderKg}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(listing.minimumOrderKg, Number(e.target.value)))}
                className="flex-1 text-center text-sm font-bold py-2 border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={() => setQuantity(q => Math.min(listing.quantityKg, q + listing.minimumOrderKg))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#333] bg-white dark:bg-[#111] flex items-center justify-center text-slate-700 dark:text-[#e0e0e0] hover:bg-slate-50 transition-colors"
              >
                <Icon name="Plus" size={14} />
              </button>
            </div>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-500">Total Cost</span>
              <span className="font-black text-blue-700 dark:text-blue-400 text-lg">৳{totalCost.toLocaleString()}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleAddToCart}
              loading={addingToCart}
              icon={Icon.bind(null, { name: "ShoppingCart" }) as any}
            >
              {user ? "Add to Cart" : "Login to Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
