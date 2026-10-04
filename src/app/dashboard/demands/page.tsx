"use client";

import { DemandBoard } from "@/features/marketplace/demands/DemandBoard";

/**
 * Buyer portal demand board.
 *
 * Only BUYER_ROUTE_MAP points here. The board itself is scope-aware: a buyer
 * gets their own demands, a farmer gets everything still open to answer, so no
 * role gate is applied — `GET /api/demands` narrows per caller.
 */
export default function Page() {
  return <DemandBoard />;
}
