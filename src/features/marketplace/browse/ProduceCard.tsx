"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { SaveToggle } from "./SaveToggle";
import { type ProduceListing, type QualityGrade } from "@/lib/marketplaceApi";

/**
 * One produce card: the browse grid and the saved shelf render the same
 * listing the same way, so the markup lives here once.
 *
 * The heart sits *outside* the `<Link>` rather than nested inside it. A
 * `<button>` within an `<a>` is invalid HTML and would need a
 * `preventDefault` on every click to stop it navigating; a sibling in a
 * `relative` wrapper gets correct behaviour for free — clicking the card
 * opens the listing, clicking the heart does not.
 */
const GRADE_VARIANT: Record<
  QualityGrade,
  "success" | "warning" | "neutral" | "info" | "danger"
> = {
  "Grade A": "success",
  "Grade B": "warning",
  "Grade C": "neutral",
  // Not yet inspected — neutral-blue rather than green, so an ungraded lot
  // never reads as premium.
  "Pending Inspection": "info",
  // The inspector failed it: published only so the badge reads honestly if
  // an admin overrides the gate, never as a passing colour.
  Rejected: "danger",
};

interface Props {
  listing: ProduceListing;
  /**
   * Where detail pages live. `/products` on the public route; a caller
   * mounting the grid elsewhere passes its own root so the link target is
   * never hard-coded inside the card.
   */
  basePath?: string;
  /**
   * Called after a heart settles. The browse grid keeps it so the next
   * render shows the new state; the saved shelf uses it to drop the row
   * straight away instead of refetching the whole page.
   */
  onSaveChange?: (listingId: string, saved: boolean) => void;
}

export function ProduceCard({ listing, basePath = "/products", onSaveChange }: Props) {
  const { user } = useAuth();

  return (
    <div className="relative">
      <Link
        href={`${basePath}/${listing.id}`}
        className="group block bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] overflow-hidden hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-lg transition-all duration-200"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={listing.imageUrl}
            alt={listing.cropName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
            <Badge variant={GRADE_VARIANT[listing.qualityGrade]} size="sm">
              {listing.qualityGrade}
            </Badge>
            {listing.isVerified && (
              <span className="flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                <Icon name="ShieldCheck" size={9} /> Verified
              </span>
            )}
          </div>
          <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-black text-blue-700 dark:text-blue-400">
            ৳{listing.pricePerKgBdt}
            <span className="text-[10px] font-normal">/kg</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-[#f0f0f0]">
            {listing.cropName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0]">{listing.variety}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Icon name="MapPin" size={11} />
              {listing.location}
            </span>
            <span className="text-[11px] text-slate-400">
              {listing.quantityKg.toLocaleString()} kg
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-[#1a1a1a]">
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[9px] font-bold shrink-0">
              {listing.farmerAvatar}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-[#a0a0a0] truncate">
              {listing.farmerName}
            </span>
            <span className="text-[11px] text-slate-400 ml-auto shrink-0">
              Min {listing.minimumOrderKg} kg
            </span>
          </div>
        </div>
      </Link>

      {user && (
        <div className="absolute top-2 right-2 z-10">
          <SaveToggle
            listingId={listing.id}
            saved={!!listing.saved}
            onChange={onSaveChange}
          />
        </div>
      )}
    </div>
  );
}
