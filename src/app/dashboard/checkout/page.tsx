import { CheckoutPage } from "@/features/marketplace/cart/CheckoutPage";

/**
 * Checkout for the shared cart. Sits at `/dashboard/checkout` rather than the
 * retired `/marketplace/checkout` because it is an authenticated action and
 * RouteGuard already covers this subtree.
 */
export default function Checkout() {
  return <CheckoutPage />;
}
