"use client";

import { PortalGate } from "@/features/layout/PortalGate";
import { OrdersManagement } from "@/features/admin/orders";
import { BuyerOrders } from "@/features/marketplace/orders/BuyerOrders";

/**
 * Shared URL: the admin portal's "Orders" and the buyer portal's "My Orders"
 * both live at `/dashboard/orders` (see ADMIN_ROUTE_MAP and BUYER_ROUTE_MAP).
 * The gate picks the component; roles with neither portal get the lock state
 * rather than a request the API would reject.
 */
export default function Page() {
  return (
    <PortalGate
      allow={["admin"]}
      moduleLabel="Orders"
      // Every `main`-portal role gets the marketplace's My Orders page — the
      // sidebar offers it to all of them, and a farmer or supplier buys
      // inputs exactly the way a buyer does.
      fallbackAllow={["farmer", "buyer", "supplier"]}
      fallback={<BuyerOrders view="active" />}
    >
      <OrdersManagement />
    </PortalGate>
  );
}
