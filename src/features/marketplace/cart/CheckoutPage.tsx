"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { useT } from "@/components/dashboard/useT";
import { tr } from "@/lib/localize";
import {
  getCart,
  clearCart,
  checkoutCart,
  createStripeCheckout,
  getStripeCheckoutStatus,
  type CartItem,
  type StripeCheckoutStatus,
} from "@/lib/marketplaceApi";

const PAYMENT_METHODS = [
  { id: "bKash", label: "bKash", icon: "💳", color: "bg-pink-50 border-pink-200 dark:bg-pink-500/10 dark:border-pink-500/30" },
  { id: "Nagad", label: "Nagad", icon: "💳", color: "bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/30" },
  { id: "Rocket", label: "Rocket", icon: "💳", color: "bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/30" },
  { id: "Bank Transfer", label: "Bank Transfer", icon: "🏦", color: "bg-slate-50 border-slate-200 dark:bg-[#1a1a1a] dark:border-[#333]" },
  { id: "Card", label: "Card (Stripe)", icon: "💳", color: "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30" },
] as const;

export function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const t = useT();

  const pmLabel = (id: string) =>
    ({
      bKash: "bKash",
      Nagad: "Nagad",
      Rocket: "Rocket",
      "Bank Transfer": t("ব্যাংক ট্রান্সফার", "Bank Transfer"),
      Card: t("কার্ড (স্ট্রাইপ)", "Card (Stripe)"),
    }[id] ?? id);
  const [items, setItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<"details" | "payment" | "confirm" | "done">("details");
  const [paymentMethod, setPaymentMethod] = useState<string>("bKash");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  /**
   * Where a browser returning from Stripe's hosted page lands. `pending` means
   * the buyer came back on the success_url but the backend has not confirmed
   * the charge yet; `cancelled` means they abandoned before paying. Everything
   * else (null) is the normal in-app checkout.
   */
  const [stripeReturn, setStripeReturn] = useState<
    "pending" | "confirmed" | "cancelled" | "failed" | "verification-error" | null
  >(null);
  const [stripeReceipt, setStripeReceipt] = useState<StripeCheckoutStatus | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const sessionId = params.get("session_id");

    // Returned from Stripe. The `?success=1` query alone proves nothing — the
    // URL is signed by Stripe but still just a string — so the real payment
    // state is read back from the backend before the cart is cleared.
    if (success === "1" && sessionId) {
      setVerifying(true);
      getStripeCheckoutStatus(sessionId)
        .then((res) => {
          if (res.success && res.data?.confirmed) {
            clearCart();
            setStripeReceipt(res.data);
            setStripeReturn("confirmed");
          } else if (res.success && res.data?.status === "expired") {
            setStripeReturn("failed");
          } else {
            setStripeReturn("pending");
          }
        })
        .catch(() => setStripeReturn("verification-error"))
        .finally(() => setVerifying(false));
      return;
    }

    if (params.get("cancel") === "1") {
      // Abandoned before paying: nothing was charged and the cart is untouched.
      setStripeReturn("cancelled");
      return;
    }

    const cart = getCart();
    if (cart.length === 0) {
      router.push("/dashboard/cart");
      return;
    }
    // Use RAF to defer setState outside of effect
    const rafId = requestAnimationFrame(() => setItems(cart));
    return () => cancelAnimationFrame(rafId);
  }, [router]);

  const reVerifyStripe = async () => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setStripeReturn("cancelled");
      return;
    }
    setVerifying(true);
    try {
      const res = await getStripeCheckoutStatus(sessionId);
      if (res.success && res.data?.confirmed) {
        clearCart();
        setStripeReceipt(res.data);
        setStripeReturn("confirmed");
      } else if (res.success && res.data?.status === "expired") {
        setStripeReturn("failed");
      } else {
        showToast("info", t(
          "পেমেন্ট এখনো নিশ্চিত হচ্ছে। কয়েক সেকেন্ড পর আবার চেষ্টা করুন।",
          "Payment is still being confirmed. Try again in a few seconds."
        ));
      }
    } catch {
      setStripeReturn("verification-error");
    } finally {
      setVerifying(false);
    }
  };

  const subtotal = items.reduce((s, i) => s + i.pricePerKgBdt * i.quantityKg, 0);
  const deliveryFee = 500;
  const total = subtotal + deliveryFee;

  const [addrErr, setAddrErr] = useState("");
  const [phoneErr, setPhoneErr] = useState("");

  const validateDetails = () => {
    const phoneClean = phone.replace(/[\s-]/g, "");
    const addressTrim = address.trim();
    if (!addressTrim) {
      setAddrErr(t("ডেলিভারি ঠিকানা দিন।", "Please fill in delivery address."));
      setPhoneErr(phoneErr);
      return false;
    }
    if (addressTrim.length < 10) {
      setAddrErr(t("ঠিকানাটি কমপক্ষে ১০টি অক্ষর হতে হবে।", "Address must be at least 10 characters."));
      return false;
    }
    if (addressTrim.length > 240) {
      setAddrErr(t("ঠিকানা ২৪০ অক্ষরের বেশি হতে পারবে না।", "Address must be 240 characters or fewer."));
      return false;
    }
    setAddrErr("");
    if (!phoneClean) {
      setPhoneErr(t("ফোন নম্বর দিন।", "Please fill in phone number."));
      return false;
    }
    if (!/^01[3-9]\d{8}$/.test(phoneClean)) {
      setPhoneErr(t("সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)।", "Please enter a valid Bangladeshi mobile number (e.g., 01XXXXXXXXX)."));
      return false;
    }
    setPhoneErr("");
    return true;
  };

  const handleGoToPayment = () => {
    if (validateDetails()) {
      setStep("payment");
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateDetails()) return;
    const phoneClean = phone.replace(/[\s-]/g, "");
    const addressTrim = address.trim();
    setPlacing(true);

    if (paymentMethod === "Card") {
      const res = await createStripeCheckout(items, addressTrim, phoneClean, notes.trim());
      if (!res.success || !res.data?.sessionUrl) {
        showToast("error", res.message || t(
          "স্ট্রাইপ চেকআউট শুরু করা যায়নি।",
          "Could not start Stripe checkout."
        ));
        setPlacing(false);
        return;
      }
      window.location.href = res.data.sessionUrl;
      return;
    }

    const res = await checkoutCart(items, addressTrim, paymentMethod, phoneClean, notes.trim());
    if (!res.success) {
      showToast("error", res.message || t(
        "অর্ডার বসানো যায়নি।",
        "Could not place your order."
      ));
      setPlacing(false);
      return;
    }

    clearCart();
    setStep("done");
    setPlacing(false);
  };

  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6">
          <Icon name="CheckCircle" size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] mb-2">{t("অর্ডার সফল হয়েছে!", "Order Placed!")}</h1>
        <p className="text-slate-500 dark:text-[#a0a0a0] text-sm mb-6">
          {t(
            "আপনার অর্ডার সফলভাবে বসানো হয়েছে। বিক্রেতা ২৪ ঘণ্টার মধ্যে নিশ্চিত করবে, আর ফসলের লাইনগুলো মান পরিদর্শনেরও মধ্য দিয়ে যাবে।",
            "Your order has been placed successfully. The seller will confirm within 24 hours, and produce lines also go through quality inspection."
          )}
        </p>
        <div className="bg-slate-50 dark:bg-[#0f0f0f] rounded-2xl p-4 text-left mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{t("মোট পরিশোধ", "Total Paid")}</span>
            <span className="font-black text-blue-700 dark:text-blue-400">৳{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-500">{t("পেমেন্ট মাধ্যম", "Payment Method")}</span>
            <span className="font-semibold text-slate-800 dark:text-[#e0e0e0]">{pmLabel(paymentMethod)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard/orders")}>
            {t("অর্ডার ট্র্যাক করুন", "Track Order")}
          </Button>
          <Button className="flex-1" onClick={() => router.push("/products")}>
            {t("কেনাকাটা চালিয়ে যান", "Continue Shopping")}
          </Button>
        </div>
      </div>
    );
  }

  // Returned from Stripe with the backend having confirmed the charge.
  if (stripeReturn === "confirmed") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-emerald-950/5 dark:border-[#222] dark:bg-[#0a0a0a]">
          <div className="bg-gradient-to-br from-emerald-50 to-white px-6 py-8 text-center dark:from-emerald-500/10 dark:to-[#0a0a0a] sm:px-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Icon name="CheckCircle" size={34} />
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">{t("পেমেন্ট সফল", "Payment successful")}</p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] sm:text-3xl">{t("অর্ডারের জন্য ধন্যবাদ!", "Thank you for your order!")}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-[#a0a0a0]">
              {t(
                "আপনার কার্ড পেমেন্ট Stripe-তে নিরাপদে নিশ্চিত হয়েছে। আপনার অর্ডার এখন প্রস্তুত করা হচ্ছে।",
                "Your card payment was confirmed securely by Stripe. Your order is now being prepared."
              )}
            </p>
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-[#222] dark:bg-[#111]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">{t("ক্রয়কৃত পণ্য", "Purchased items")}</h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  {t("কার্ড · Stripe", "Card · Stripe")}
                </span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-[#292929]">
                {(stripeReceipt?.orders || []).map((order) => (
                  <div key={order.orderCode} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-[#f0f0f0]">{tr(order.productName)}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-[#a0a0a0]">
                        {order.quantity} {order.unit} × ৳{order.unitPriceBdt.toLocaleString()}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">{t("অর্ডার", "Order")} {order.orderCode}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">
                      ৳{order.totalAmountBdt.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              {!stripeReceipt?.orders.length && (
                <p className="py-2 text-sm text-slate-500 dark:text-[#a0a0a0]">
                  {t(
                    "আপনার অর্ডার নিশ্চিত হয়েছে। বিস্তারিত আপনার অর্ডার পেজে দেখতে পাবেন।",
                    "Your order is confirmed. Full item details are available in your orders."
                  )}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-[#292929]">
                <span className="text-sm font-semibold text-slate-600 dark:text-[#a0a0a0]">{t("মোট পরিশোধ", "Total paid")}</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                  ৳{(stripeReceipt?.totalAmountBdt || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="mb-5 text-center text-xs text-slate-500 dark:text-[#a0a0a0]">
              {t(
                "ডেলিভারি নিশ্চিত না হওয়া পর্যন্ত আপনার পেমেন্ট নিরাপদে রাখা হয়।",
                "Your payment is held securely until delivery is confirmed."
              )}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" onClick={() => router.push("/dashboard/orders")}>
                {t("সব অর্ডার দেখুন", "View all my orders")}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => router.push("/products")}>
                {t("কেনাকাটা চালিয়ে যান", "Continue shopping")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Returned from Stripe but the charge has not been confirmed yet — usually a
  // race with the webhook. The cart is kept so nothing is lost on a refresh.
  if (stripeReturn === "pending") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6">
          <Icon name="Clock" size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] mb-2">{t("আপনার পেমেন্ট নিশ্চিত হচ্ছে…", "Confirming Your Payment…")}</h1>
        <p className="text-slate-500 dark:text-[#a0a0a0] text-sm mb-6">
          {t(
            "Stripe থেকে ফিরে এসেছেন, কিন্তু পেমেন্টের অবস্থা এখনো নিশ্চিত হচ্ছে। সাধারণত কয়েক সেকেন্ডেই হয়ে যায় — আপনার কার্ট নিরাপদে রাখা হয়েছে।",
            "We saw your return from Stripe but the payment status is still being confirmed. This usually settles in a few seconds — your cart is kept safe."
          )}
        </p>
        <div className="flex gap-3">
          <Button className="flex-1" loading={verifying} onClick={reVerifyStripe}>
            {t("পেমেন্ট অবস্থা দেখুন", "Check Payment Status")}
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard/orders")}>
            {t("অর্ডার দেখুন", "View Orders")}
          </Button>
        </div>
      </div>
    );
  }

  if (stripeReturn === "verification-error") {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">
        <div className="rounded-3xl border border-blue-200 bg-white p-6 text-center shadow-xl shadow-blue-950/5 dark:border-blue-500/20 dark:bg-[#0a0a0a] sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <Icon name="Clock" size={34} />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400">{t("পেমেন্ট অবস্থা পাওয়া যায়নি", "Payment status unavailable")}</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] sm:text-3xl">{t("আমরা এখনো পেমেন্ট যাচাই করতে পারিনি", "We could not verify the payment yet")}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-[#a0a0a0]">
            {t(
              "আপনার কার্ট নিরাপদে আছে। আবার পেমেন্টের চেষ্টার আগে চেক করুন; Stripe নিশ্চিত করলেই আপনার কার্ড থেকে টাকা কাটা হিসেবে ধরা হবে।",
              "Your cart is safe. Check again before trying to pay again; your card will only be treated as paid after Stripe confirms it."
            )}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" loading={verifying} onClick={reVerifyStripe}>
              {t("পেমেন্ট অবস্থা দেখুন", "Check payment status")}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard/orders")}>
              {t("আমার অর্ডার দেখুন", "View my orders")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (stripeReturn === "failed") {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">
        <div className="rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-xl shadow-rose-950/5 dark:border-rose-500/20 dark:bg-[#0a0a0a] sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <Icon name="XCircle" size={34} />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-700 dark:text-rose-400">{t("পেমেন্ট সম্পন্ন হয়নি", "Payment not completed")}</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] sm:text-3xl">{t("আপনার চেকআউট সেশন মেয়াদোত্তীর্ণ হয়েছে", "Your checkout session expired")}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-[#a0a0a0]">
            {t(
              "Stripe নিশ্চিত করেছে এই চেকআউট পেমেন্ট সম্পন্ন না করেই মেয়াদ শেষ হয়ে গেছে। এই সেশনের জন্য কোনো টাকা কাটা হয়নি। আপনার কার্ট এখনও আছে, আবার চেষ্টা করতে পারেন।",
              "Stripe confirmed that this checkout expired without completing payment. You were not charged for this session. Your cart is still available so you can try again."
            )}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={() => router.push("/dashboard/cart")}>
              {t("কার্টে ফিরে আবার চেষ্টা করুন", "Return to cart and try again")}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.push("/products")}>
              {t("কেনাকাটা চালিয়ে যান", "Continue shopping")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Abandoned the Stripe page before paying: nothing charged, cart intact.
  if (stripeReturn === "cancelled") {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">
        <div className="rounded-3xl border border-amber-200 bg-white p-6 text-center shadow-xl shadow-amber-950/5 dark:border-amber-500/20 dark:bg-[#0a0a0a] sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Icon name="XCircle" size={34} />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">{t("কোনো পেমেন্ট সম্পন্ন হয়নি", "No payment was completed")}</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] sm:text-3xl">{t("আপনার চেকআউট শেষ হয়নি", "Your checkout was not finished")}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-[#a0a0a0]">
            {t(
              "কার্ড পেমেন্ট বাতিল হয়েছে বা সম্পন্ন হয়নি। আমরা এই অর্ডারকে পরিশোধিত হিসেবে চিহ্নিত করিনি, আর আপনার কার্টের পণ্যগুলো এখনও নিরাপদ।",
              "The card payment was cancelled or did not complete. We have not marked this order as paid, and the items in your cart are still safe."
            )}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={() => router.push("/dashboard/cart")}>
              {t("কার্টে ফিরে আবার চেষ্টা করুন", "Return to cart and try again")}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.push("/products")}>
              {t("কেনাকাটা চালিয়ে যান", "Continue shopping")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/dashboard/cart" className="hover:text-blue-600">{t("কার্ট", "Cart")}</Link>
        <Icon name="ChevronRight" size={12} />
        <span className="text-slate-700 dark:text-[#e0e0e0] font-medium">{t("চেকআউট", "Checkout")}</span>
      </nav>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { id: "details", label: t("ডেলিভারি তথ্য", "Delivery Details") },
          { id: "payment", label: t("পেমেন্ট", "Payment") },
          { id: "confirm", label: t("নিশ্চিত করুন", "Confirm") },
        ].map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-2 text-xs font-semibold ${step === s.id ? "text-blue-600 dark:text-blue-400" : idx < ["details","payment","confirm"].indexOf(step) ? "text-emerald-600" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === s.id ? "bg-blue-600 text-white" : idx < ["details","payment","confirm"].indexOf(step) ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-[#333] text-slate-400"}`}>
                {idx < ["details","payment","confirm"].indexOf(step) ? <Icon name="Check" size={12} /> : idx + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {idx < 2 && <div className="flex-1 h-px bg-slate-200 dark:bg-[#333]" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2">
          {step === "details" && (
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-6 space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-[#f0f0f0]">{t("ডেলিভারি তথ্য", "Delivery Details")}</h2>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("সম্পূর্ণ ডেলিভারি ঠিকানা *", "Full Delivery Address *")}</label>
                <textarea
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setAddrErr(""); }}
                  onBlur={() => {
                    const addressTrim = address.trim();
                    if (!addressTrim) { setAddrErr(t("ডেলিভারি ঠিকানা দিন।", "Please fill in delivery address.")); return; }
                    if (addressTrim.length < 10) { setAddrErr(t("ঠিকানাটি কমপক্ষে ১০টি অক্ষর হতে হবে।", "Address must be at least 10 characters.")); return; }
                    if (addressTrim.length > 240) { setAddrErr(t("ঠিকানা ২৪০ অক্ষরের বেশি হতে পারবে না।", "Address must be 240 characters or fewer.")); return; }
                    setAddrErr("");
                  }}
                  placeholder={t("বাসা #, রাস্তা #, এলাকা, জেলা, পোস্ট কোড", "House #, Road #, Area, District, Postal Code")}
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                />
                {addrErr && <p className="mt-1 text-xs text-red-600">{addrErr}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("যোগাযোগের ফোন *", "Contact Phone *")}</label>
                <input
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneErr(""); }}
                  onBlur={() => {
                    const phoneClean = phone.replace(/[\s-]/g, "");
                    if (!phoneClean) { setPhoneErr(t("ফোন নম্বর দিন।", "Please fill in phone number.")); return; }
                    if (!/^01[3-9]\d{8}$/.test(phoneClean)) { setPhoneErr(t("সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)।", "Please enter a valid Bangladeshi mobile number (e.g., 01XXXXXXXXX).")); return; }
                    setPhoneErr("");
                  }}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
                {phoneErr && <p className="mt-1 text-xs text-red-600">{phoneErr}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("বিশেষ নির্দেশনা (ঐচ্ছিক)", "Special Instructions (optional)")}</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("যেকোনো ডেলিভারি নোট...", "Any delivery notes...")}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <Button className="w-full" size="lg" onClick={handleGoToPayment}>
                {t("পেমেন্টে চালিয়ে যান", "Continue to Payment")}
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-6 space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-[#f0f0f0]">{t("পেমেন্ট মাধ্যম", "Payment Method")}</h2>
              <p className="text-xs text-slate-500">{t("ডেলিভারি নিশ্চিত না হওয়া পর্যন্ত পেমেন্ট এসক্রোতে থাকে।", "Payment is escrowed until delivery is confirmed.")}</p>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${paymentMethod === pm.id ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" : `border-slate-200 dark:border-[#333] ${pm.color} text-slate-700 dark:text-[#e0e0e0]`}`}
                  >
                    <span>{pm.icon}</span> {pmLabel(pm.id)}
                    {paymentMethod === pm.id && <Icon name="CheckCircle2" size={15} className="ml-auto text-blue-500" />}
                  </button>
                ))}
              </div>
              {(paymentMethod === "bKash" || paymentMethod === "Nagad" || paymentMethod === "Rocket") && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 flex gap-2">
                  <Icon name="Info" size={14} className="shrink-0 mt-0.5" />
                  <span>{t(
                    "অর্ডার নিশ্চিত হওয়ার পর আপনার {paymentMethod} নম্বরে পেমেন্ট রিকোয়েস্ট আসবে। ডেলিভারি পর্যন্ত টাকা এসক্রোতে থাকে।",
                    "You will receive a payment request on your {paymentMethod} number after order confirmation. Funds are held in escrow until delivery."
                  ).replace("{paymentMethod}", paymentMethod)}</span>
                </div>
              )}
              {paymentMethod === "Card" && (
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-400 flex gap-2">
                  <Icon name="Info" size={14} className="shrink-0 mt-0.5" />
                  <span>{t(
                    "নিরাপদ Stripe চেকআউটে রিডাইরেক্ট হয়ে কার্ডে পেমেন্ট করবেন (টেস্ট মোড; 4242 4242 4242 4242 চেষ্টা করুন)। ডেলিভারি পর্যন্ত টাকা এসক্রোতে থাকে।",
                    "You will be redirected to Stripe's secure checkout to pay by card (test mode; try 4242 4242 4242 4242). Funds are held in escrow until delivery."
                  )}</span>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("details")}>{t("পিছনে", "Back")}</Button>
                <Button className="flex-1" size="lg" onClick={() => setStep("confirm")}>
                  {t("অর্ডার রিভিউ", "Review Order")}
                </Button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-6 space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-[#f0f0f0]">{t("রিভিউ ও নিশ্চিত করুন", "Review & Confirm")}</h2>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.lineId} className="flex gap-3 items-center py-2 border-b border-slate-100 dark:border-[#1a1a1a] last:border-0">
                    <img src={item.imageUrl} alt={tr(item.cropName)} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0]">{tr(item.cropName)}</p>
                      <p className="text-xs text-slate-400">{item.quantityKg} {item.unitLabel} × ৳{item.pricePerKgBdt}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-[#e0e0e0]">৳{(item.pricePerKgBdt * item.quantityKg).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 dark:bg-[#0f0f0f] rounded-xl p-3 text-xs space-y-1">
                <p><span className="text-slate-400">{t("ঠিকানা:", "Address:")}</span> <span className="text-slate-700 dark:text-[#e0e0e0]">{address}</span></p>
                <p><span className="text-slate-400">{t("ফোন:", "Phone:")}</span> <span className="text-slate-700 dark:text-[#e0e0e0]">{phone}</span></p>
                <p><span className="text-slate-400">{t("পেমেন্ট:", "Payment:")}</span> <span className="text-slate-700 dark:text-[#e0e0e0]">{pmLabel(paymentMethod)}</span></p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("payment")}>{t("পিছনে", "Back")}</Button>
                <Button className="flex-1" size="lg" loading={placing} onClick={handlePlaceOrder}>
                  {t("অর্ডার দিন", "Place Order")} — ৳{total.toLocaleString()}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-5 h-fit">
          <h3 className="font-semibold text-slate-900 dark:text-[#f0f0f0] mb-3 text-sm">{t("অর্ডার সামারি", "Order Summary")}</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>{t("সাবটোটাল", "Subtotal")}</span><span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>{t("ডেলিভারি", "Delivery")}</span><span>৳{deliveryFee}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 dark:text-[#f0f0f0] pt-2 border-t border-slate-100 dark:border-[#1a1a1a]">
              <span>{t("মোট", "Total")}</span><span className="text-blue-700 dark:text-blue-400">৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
