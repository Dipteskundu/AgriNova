"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
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
        showToast("info", "Payment is still being confirmed. Try again in a few seconds.");
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

  const handlePlaceOrder = async () => {
    if (!address.trim() || !phone.trim()) {
      showToast("error", "Please fill in delivery address and phone number.");
      return;
    }
    setPlacing(true);

    // Stripe: create a hosted Checkout Session for the WHOLE cart, then hand
    // the browser to Stripe. Orders are written server-side but stay on
    // "pending" — nothing is paid here, and the cart is deliberately NOT
    // cleared: it is wiped on the success return, only after the backend
    // confirms the charge (see `stripeReturn` handling above).
    if (paymentMethod === "Card") {
      const res = await createStripeCheckout(items, address.trim());
      if (!res.success || !res.data?.sessionUrl) {
        showToast("error", res.message || "Could not start Stripe checkout.");
        setPlacing(false);
        return;
      }
      window.location.href = res.data.sessionUrl;
      return;
    }

    // Real orders: stock, escrow payment and the payment history are all
    // written server-side. The cart is only cleared once every line lands, so
    // a failed checkout leaves the basket intact for a retry.
    const res = await checkoutCart(items, address.trim(), paymentMethod);
    if (!res.success) {
      showToast("error", res.message || "Could not place your order.");
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
        <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] mb-2">Order Placed!</h1>
        <p className="text-slate-500 dark:text-[#a0a0a0] text-sm mb-6">
          Your order has been placed successfully. The seller will confirm within 24 hours, and produce lines also go through quality inspection.
        </p>
        <div className="bg-slate-50 dark:bg-[#0f0f0f] rounded-2xl p-4 text-left mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total Paid</span>
            <span className="font-black text-blue-700 dark:text-blue-400">৳{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-500">Payment Method</span>
            <span className="font-semibold text-slate-800 dark:text-[#e0e0e0]">{paymentMethod}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard/orders")}>
            Track Order
          </Button>
          <Button className="flex-1" onClick={() => router.push("/products")}>
            Continue Shopping
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
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Payment successful</p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] sm:text-3xl">Thank you for your order!</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-[#a0a0a0]">
              Your card payment was confirmed securely by Stripe. Your order is now being prepared.
            </p>
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-[#222] dark:bg-[#111]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">Purchased items</h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  Card · Stripe
                </span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-[#292929]">
                {(stripeReceipt?.orders || []).map((order) => (
                  <div key={order.orderCode} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-[#f0f0f0]">{order.productName}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-[#a0a0a0]">
                        {order.quantity} {order.unit} × ৳{order.unitPriceBdt.toLocaleString()}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">Order {order.orderCode}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">
                      ৳{order.totalAmountBdt.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              {!stripeReceipt?.orders.length && (
                <p className="py-2 text-sm text-slate-500 dark:text-[#a0a0a0]">
                  Your order is confirmed. Full item details are available in your orders.
                </p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-[#292929]">
                <span className="text-sm font-semibold text-slate-600 dark:text-[#a0a0a0]">Total paid</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                  ৳{(stripeReceipt?.totalAmountBdt || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="mb-5 text-center text-xs text-slate-500 dark:text-[#a0a0a0]">
              Your payment is held securely until delivery is confirmed.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" onClick={() => router.push("/dashboard/orders")}>
                View all my orders
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => router.push("/products")}>
                Continue shopping
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
        <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] mb-2">Confirming Your Payment…</h1>
        <p className="text-slate-500 dark:text-[#a0a0a0] text-sm mb-6">
          We saw your return from Stripe but the payment status is still being confirmed. This usually settles in a few seconds — your cart is kept safe.
        </p>
        <div className="flex gap-3">
          <Button className="flex-1" loading={verifying} onClick={reVerifyStripe}>
            Check Payment Status
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard/orders")}>
            View Orders
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
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400">Payment status unavailable</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] sm:text-3xl">We could not verify the payment yet</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-[#a0a0a0]">
            Your cart is safe. Check again before trying to pay again; your card will only be treated as paid after Stripe confirms it.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" loading={verifying} onClick={reVerifyStripe}>
              Check payment status
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard/orders")}>
              View my orders
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
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-700 dark:text-rose-400">Payment not completed</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] sm:text-3xl">Your checkout session expired</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-[#a0a0a0]">
            Stripe confirmed that this checkout expired without completing payment. You were not charged for this session. Your cart is still available so you can try again.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={() => router.push("/dashboard/cart")}>
              Return to cart and try again
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.push("/products")}>
              Continue shopping
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
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">No payment was completed</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#f0f0f0] sm:text-3xl">Your checkout was not finished</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-[#a0a0a0]">
            The card payment was cancelled or did not complete. We have not marked this order as paid, and the items in your cart are still safe.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={() => router.push("/dashboard/cart")}>
              Return to cart and try again
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.push("/products")}>
              Continue shopping
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
        <Link href="/dashboard/cart" className="hover:text-blue-600">Cart</Link>
        <Icon name="ChevronRight" size={12} />
        <span className="text-slate-700 dark:text-[#e0e0e0] font-medium">Checkout</span>
      </nav>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { id: "details", label: "Delivery Details" },
          { id: "payment", label: "Payment" },
          { id: "confirm", label: "Confirm" },
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
              <h2 className="font-bold text-slate-900 dark:text-[#f0f0f0]">Delivery Details</h2>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">Full Delivery Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Road #, Area, District, Postal Code"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">Contact Phone *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">Special Instructions (optional)</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any delivery notes..."
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <Button className="w-full" size="lg" onClick={() => setStep("payment")} disabled={!address.trim() || !phone.trim()}>
                Continue to Payment
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-6 space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-[#f0f0f0]">Payment Method</h2>
              <p className="text-xs text-slate-500">Payment is escrowed until delivery is confirmed.</p>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${paymentMethod === pm.id ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" : `border-slate-200 dark:border-[#333] ${pm.color} text-slate-700 dark:text-[#e0e0e0]`}`}
                  >
                    <span>{pm.icon}</span> {pm.label}
                    {paymentMethod === pm.id && <Icon name="CheckCircle2" size={15} className="ml-auto text-blue-500" />}
                  </button>
                ))}
              </div>
              {(paymentMethod === "bKash" || paymentMethod === "Nagad" || paymentMethod === "Rocket") && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 flex gap-2">
                  <Icon name="Info" size={14} className="shrink-0 mt-0.5" />
                  <span>You will receive a payment request on your {paymentMethod} number after order confirmation. Funds are held in escrow until delivery.</span>
                </div>
              )}
              {paymentMethod === "Card" && (
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-400 flex gap-2">
                  <Icon name="Info" size={14} className="shrink-0 mt-0.5" />
                  <span>You will be redirected to Stripe's secure checkout to pay by card (test mode; try 4242 4242 4242 4242). Funds are held in escrow until delivery.</span>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("details")}>Back</Button>
                <Button className="flex-1" size="lg" onClick={() => setStep("confirm")}>
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-6 space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-[#f0f0f0]">Review & Confirm</h2>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.lineId} className="flex gap-3 items-center py-2 border-b border-slate-100 dark:border-[#1a1a1a] last:border-0">
                    <img src={item.imageUrl} alt={item.cropName} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0]">{item.cropName}</p>
                      <p className="text-xs text-slate-400">{item.quantityKg} {item.unitLabel} × ৳{item.pricePerKgBdt}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-[#e0e0e0]">৳{(item.pricePerKgBdt * item.quantityKg).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 dark:bg-[#0f0f0f] rounded-xl p-3 text-xs space-y-1">
                <p><span className="text-slate-400">Address:</span> <span className="text-slate-700 dark:text-[#e0e0e0]">{address}</span></p>
                <p><span className="text-slate-400">Phone:</span> <span className="text-slate-700 dark:text-[#e0e0e0]">{phone}</span></p>
                <p><span className="text-slate-400">Payment:</span> <span className="text-slate-700 dark:text-[#e0e0e0]">{paymentMethod}</span></p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("payment")}>Back</Button>
                <Button className="flex-1" size="lg" loading={placing} onClick={handlePlaceOrder}>
                  Place Order — ৳{total.toLocaleString()}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-5 h-fit">
          <h3 className="font-semibold text-slate-900 dark:text-[#f0f0f0] mb-3 text-sm">Order Summary</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span><span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery</span><span>৳{deliveryFee}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 dark:text-[#f0f0f0] pt-2 border-t border-slate-100 dark:border-[#1a1a1a]">
              <span>Total</span><span className="text-blue-700 dark:text-blue-400">৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
