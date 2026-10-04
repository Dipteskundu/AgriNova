import { CartPage } from "@/features/marketplace/cart/CartPage";

/**
 * The shared basket — produce from `/products` and inputs from `/inputs` sit
 * together here. Moved out of the retired `(marketplace)` route group; it
 * lives under `/dashboard` because that is where RouteGuard already guarantees
 * the session the checkout half needs.
 */
export default function Cart() {
  return <CartPage />;
}
