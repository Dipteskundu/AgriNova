"use client";

import { PortalGate } from "@/features/layout/PortalGate";
import { SavedListings } from "@/features/marketplace/saved/SavedListings";

/**
 * `/dashboard/saved` — the produce a reader has hearted.
 *
 * Open to every `main`-portal role rather than buyers only, which is what the
 * sidebar already implies: `MARKETPLACE_NAV_GROUP` is shared, so the item
 * renders for farmers and suppliers too, and `GET /marketplace/saved` takes
 * any signed-in caller. Gating the page to `buyer` would leave three roles
 * with a nav item that locks them out of the page behind it.
 *
 * The admin portal is the one role left out, and that is RouteGuard rather
 * than this gate — `ADMIN_ROUTE_MAP` has no `saved` entry, so an admin has
 * nowhere in their sidebar to have come from.
 */
export default function Page() {
  return (
    <PortalGate allow={["farmer", "buyer", "supplier"]} moduleLabel="Saved">
      <SavedListings />
    </PortalGate>
  );
}
