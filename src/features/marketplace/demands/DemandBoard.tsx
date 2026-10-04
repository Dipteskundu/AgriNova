"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, Plus } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { getBuyerDemands, type BuyerDemand, type DemandStatus } from "@/lib/marketplaceApi";

const STATUS_CONFIG: Record<DemandStatus, { label: string; variant: "info" | "warning" | "success" | "neutral" }> = {
  open:      { label: "Open",      variant: "info" },
  matched:   { label: "Matched",   variant: "warning" },
  fulfilled: { label: "Fulfilled", variant: "success" },
  expired:   { label: "Expired",   variant: "neutral" },
};


export function DemandBoard() {
  const { user } = useAuth();
  const [board, setBoard] = useState<BuyerDemand[]>([]);
  const [myDemands, setMyDemands] = useState<BuyerDemand[]>([]);
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Two scopes, fetched together so switching tabs is instant:
  //   board — every demand still open to an answer (public, no session needed)
  //   mine  — this account's demands in any state (requires a session)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [boardRes, mineRes] = await Promise.all([
        getBuyerDemands(),
        user ? getBuyerDemands({ mine: true }) : Promise.resolve(null),
      ]);
      if (cancelled) return;

      if (boardRes.success) setBoard(boardRes.data);
      else setError(boardRes.message || "Could not load the demand board.");

      if (mineRes?.success) setMyDemands(mineRes.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const displayList = tab === "mine" ? myDemands : board;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0]">Demand Board</h1>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">
            Buyers post what they need. Farmers respond directly.
          </p>
        </div>
        <Link href="/dashboard/demands/new">
          <Button icon={Plus}>Post a Demand</Button>
        </Link>
      </div>

      {/* Tabs */}
      {user && (
        <div className="flex gap-2 mb-6">
          {(["all", "mine"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                tab === t
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-[#a0a0a0] hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
              }`}
            >
              {t === "all" ? "All Demands" : "My Demands"}
            </button>
          ))}
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-36 bg-slate-200 dark:bg-[#1a1a1a] rounded-2xl animate-pulse" />)}
        </div>
      ) : error ? (
        <EmptyState title="Could not load the demand board" description={error} />
      ) : displayList.length === 0 ? (
        <EmptyState
          title={tab === "mine" ? "You haven't posted any demands yet" : "No demands posted yet"}
          description={
            tab === "mine"
              ? "Post what you need and matching farmers will respond."
              : "Be the first to post what you need."
          }
          action={
            <Link href="/dashboard/demands/new">
              <Button>Post a Demand</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {displayList.map(demand => {
            const cfg = STATUS_CONFIG[demand.status];
            return (
              <div key={demand.id} className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-5 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-[#f0f0f0]">
                      {demand.productName}
                      {demand.variety && (
                        <span className="ml-2 text-xs font-normal text-slate-400">({demand.variety})</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{demand.buyerName}</p>
                  </div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-[#a0a0a0] mb-3 line-clamp-2">{demand.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400">Quantity</p>
                    <p className="font-semibold text-slate-800 dark:text-[#e0e0e0]">{demand.quantityKg.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Max Price</p>
                    <p className="font-semibold text-slate-800 dark:text-[#e0e0e0]">৳{demand.maxPricePerKgBdt}/kg</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Quality</p>
                    <p className="font-semibold text-slate-800 dark:text-[#e0e0e0]">{demand.qualityGrade}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Deadline</p>
                    <p className="font-semibold text-slate-800 dark:text-[#e0e0e0]">{demand.deadline}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-[#1a1a1a]">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Icon name="MapPin" size={11} /> {demand.preferredLocation}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Truck" size={11} /> {demand.deliveryMethod}
                    </span>
                    {demand.matchedFarmers > 0 && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Icon name="Users" size={11} /> {demand.matchedFarmers} farmers matched
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">Posted {demand.postedAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
