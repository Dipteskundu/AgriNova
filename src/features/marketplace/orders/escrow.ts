import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  confirmOrderReceipt,
  type BuyerOrder,
  type OrderStatus,
} from "@/lib/marketplaceApi";

export type BadgeVariant = "info" | "warning" | "success" | "neutral" | "danger";

/**
 * Where the *goods* are in the pipeline.
 *
 * Shared by the order list and the order detail page: they used to each keep
 * their own copy of this map, which is how the two pages ended up disagreeing
 * about a badge colour the moment either one changed. Labels carry both
 * scripts so a page can render whichever the reader has selected.
 */
export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; labelBn: string; variant: BadgeVariant }
> = {
  placed: { label: "Placed", labelBn: "অর্ডার দেওয়া হয়েছে", variant: "info" },
  confirmed: { label: "Confirmed", labelBn: "নিশ্চিত করা হয়েছে", variant: "info" },
  quality_check: { label: "Quality Check", labelBn: "কোয়ালিটি চেক", variant: "warning" },
  shipped: { label: "Shipped", labelBn: "পাঠানো হয়েছে", variant: "warning" },
  delivered: { label: "Delivered", labelBn: "ডেলিভার হয়েছে", variant: "success" },
  cancelled: { label: "Cancelled", labelBn: "বাতিল করা হয়েছে", variant: "danger" },
};

/**
 * Where the *money* is.
 *
 * Deliberately a separate badge from the order status: they answer different
 * questions and move independently. An order can be `shipped` while the funds
 * are still held, and it can be `delivered` while a dispute freezes them.
 */
export const ESCROW_CONFIG: Record<
  BuyerOrder["escrowStatus"],
  { label: string; labelBn: string; variant: BadgeVariant; copy: string; copyBn: string }
> = {
  "Held in Escrow": {
    label: "In Escrow",
    labelBn: "এসক্রোতে আছে",
    variant: "warning",
    copy: "The buyer's payment is held by the platform until the goods are received.",
    copyBn: "মাল হাতে না পাওয়া পর্যন্ত ক্রেতার পেমেন্ট প্ল্যাটফর্মের কাছে সুরক্ষিত থাকে।",
  },
  "Released to Farmer": {
    label: "Released",
    labelBn: "প্রদান করা হয়েছে",
    variant: "success",
    copy: "Payment released to the seller's wallet.",
    copyBn: "পেমেন্ট বিক্রেতার মানি ব্যাগে পাঠানো হয়েছে।",
  },
  Refunded: {
    label: "Refunded",
    labelBn: "ফেরত দেওয়া হয়েছে",
    variant: "neutral",
    copy: "Payment returned to the buyer.",
    copyBn: "পেমেন্ট ক্রেতাকে ফেরত দেওয়া হয়েছে।",
  },
  Disputed: {
    label: "Disputed",
    labelBn: "বিরোধ চলছে",
    variant: "danger",
    copy: "Frozen while the dispute is under review — the sweep will not release it.",
    copyBn: "বিরোধ নিষ্পত্তি না হওয়া পর্যন্ত টাকা স্থির থাকে — স্বয়ংক্রিয় মুক্তি চলবে না।",
  },
};

/**
 * May the buyer act on this order right now?
 *
 * Option A: they may confirm as soon as the money is held — they are the
 * authority on whether the goods arrived, and confirming marks the order
 * delivered in the same call. Cancelled orders, released funds and disputed
 * funds are all read-only from here.
 */
export function canActOnOrder(order: BuyerOrder): boolean {
  return order.escrowStatus === "Held in Escrow" && order.status !== "cancelled";
}

/**
 * The confirm-receipt call, shared by the list and the detail page.
 *
 * Takes the id at call time rather than binding to one order, and exposes the
 * *id* it is busy with instead of a boolean: a list of ten rows needs to know
 * which spinner to light while also locking the other nine, and the detail
 * page just checks its single id. Both pages say the same thing when it
 * succeeds or fails because the toast lives here with them.
 */
export function useConfirmReceipt(onChange: (order: BuyerOrder) => void) {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [busyId, setBusyId] = useState<string | null>(null);

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const confirm = async (orderId: string) => {
    if (busyId) return;
    setBusyId(orderId);
    const res = await confirmOrderReceipt(orderId);
    setBusyId(null);

    if (res.success && res.data) {
      onChange(res.data);
      showToast(
        "success",
        t("পেমেন্ট মুক্ত করা হয়েছে", "Payment released"),
        t("এসক্রোতে থাকা টাকা বিক্রেতার মানি ব্যাগে চলে গেছে।", "Escrow released to the seller's wallet.")
      );
    } else {
      showToast(
        "error",
        t("রসিদ নিশ্চিত করা যায়নি", "Could not confirm receipt"),
        res.message
      );
    }
  };

  return { busyId, confirm };
}
