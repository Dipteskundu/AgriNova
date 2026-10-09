/**
 * Marketplace API — Produce Marketplace data layer.
 *
 * All functions return the ApiResponse envelope so callers can use the
 * same `.success` / `.data` pattern as farmerApi / adminApi.
 *
 * The two listing functions hit the real `POST /api/marketplace` module
 * (MARKETPLACE_PORTAL_PLAN Step 2). Orders, demands, payments and dashboard
 * stats are still mock — their backend modules arrive in Step 3.
 * Cart helpers are localStorage-only by design (see the plan's Architecture
 * Decisions table).
 */

import { ApiResponse, DisputeCase, RatingItem, SupplierProduct } from "@/types";
import { api, uploadFile } from "@/lib/api";

// ─── Shared helpers ──────────────────────────────────────────

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

/**
 * Failure envelope with a caller-supplied fallback for `data` rather than a
 * null cast — list consumers do `res.data.map(...)` and should not have to
 * null-check after branching on `success`.
 */
function fail<T>(data: T, message: string): ApiResponse<T> {
  return { success: false, data, message, timestamp: new Date().toISOString() };
}

// ─── Domain types ─────────────────────────────────────────────

/**
 * `"Pending Inspection"` is a listing that no inspector has graded yet — the
 * seller cannot declare a grade themselves, so every listing starts there and
 * the quality module overwrites it when a report is submitted. `"Rejected"` is
 * the one non-passing grade an inspector can submit.
 */
export type QualityGrade =
  | "Grade A"
  | "Grade B"
  | "Grade C"
  | "Rejected"
  | "Pending Inspection";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "quality_check"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded";
export type DemandStatus = "open" | "matched" | "fulfilled" | "expired";
export type DeliveryStatus =
  | "Pending"
  | "Picked up"
  | "In transit"
  | "Out for delivery"
  | "Delivered";

export interface ProduceListing {
  id: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  farmerAvatar: string;
  cropName: string;
  variety: string;
  category:
    | "Cereal"
    | "Pulse"
    | "Oilseed"
    | "Vegetable"
    | "Fruit"
    | "Cash Crop";
  quantityKg: number;
  pricePerKgBdt: number;
  qualityGrade: QualityGrade;
  isVerified: boolean;
  harvestDate: string;
  availableUntil: string;
  imageUrl: string;
  description: string;
  minimumOrderKg: number;
  location: string;
  district: string;
  tags: string[];
  totalSoldKg: number;
  listedAt: string;
  /** Seller-supplied detail — empty string when not declared. */
  storageCondition: string;
  lotCode: string;
  certification: string;
  sampleAvailable: boolean;
  availableFrom: string;
  /**
   * Moderation state — `"Approved"` / `"Pending Review"` / `"Rejected"`.
   *
   * Optional because only the moderator and the owner's own-listings view are
   * supposed to care about it; the public browse list returns it too but the
   * server has already filtered that to approved rows.
   */
  status?: string;
  /**
   * The completed inspection attached to this lot, or `""`. Server-written
   * only (the quality module sets it on submit), and the admin approval gate
   * refuses `status: "Approved"` while it is empty.
   */
  qualityReport?: string;
  /**
   * Non-empty while an inspection request for this lot is still open, cleared
   * when the report lands. My Listings reads it to render "awaiting an
   * inspector" rather than offering a button that would 409.
   */
  inspectionRequestedAt?: string;
  /**
   * Whether the *caller* has hearted this listing.
   *
   * Server-stamped on the browse list and the detail fetch (never edited by
   * the client) so one catalogue request can render every heart correctly
   * instead of firing a lookup per card. Absent while browsing anonymously,
   * where the heart is hidden anyway.
   */
  saved?: boolean;
  /**
   * Ratings summary — server-owned, recomputed on every rating submission.
   * Optional so fixtures predating the feature still compile; the browse and
   * detail UIs default to 0 / "no ratings yet".
   */
  averageRating?: number;
  totalRatings?: number;
}

/**
 * One cart serves the whole marketplace: produce from the Products page and
 * farm inputs from the Inputs page are held together so a buyer can check out
 * once.
 *
 * The pre-existing fields keep their names and their produce meaning
 * (`pricePerKgBdt` is the line's unit price, `quantityKg` its quantity) —
 * `unitLabel` is what says whether that number means kilograms or bags.
 * Anything older sitting in `localStorage` is normalised on read by `getCart`,
 * so an un-updated cart still behaves as a produce-only cart.
 */
export type CartLineKind = "produce" | "input";

export interface CartItem {
  /**
   * Stable key for React lists and removal: `produce:<listingId>` or
   * `input:<productId>`. Ids from the two collections are independent, so a
   * bare id would be ambiguous if they ever collided.
   */
  lineId: string;
  kind: CartLineKind;
  /** Produce listing id. `""` on an input line. */
  listingId: string;
  /** Input product id. Absent on a produce line. */
  productId?: string;
  cropName: string;
  variety: string;
  /** Farmer for produce, supplier for inputs. */
  farmerName: string;
  pricePerKgBdt: number;
  quantityKg: number;
  imageUrl: string;
  qualityGrade: QualityGrade;
  /** `"kg"` for produce; the input's own unit (`bag`, `liter`, `piece`, …). */
  unitLabel: string;
  /** Input lines: stock the order cannot exceed, and its minimum order. */
  maxQuantity?: number;
  minimumOrder?: number;
}

export interface BuyerOrder {
  id: string;
  orderCode: string;
  listing: {
    id: string;
    cropName: string;
    variety: string;
    imageUrl: string;
    qualityGrade: QualityGrade;
  };
  farmerName: string;
  farmerPhone: string;
  buyerName: string;
  quantityKg: number;
  /**
   * Produce lines are `"kg"`; input lines carry the input's own unit, because
   * the server stores the quantity in `volumeKg` for both and keeps the label
   * separately (`unitLabel`). Defaults to `"kg"` for anything older.
   */
  unit: string;
  /** `"produce"` when this came from the Products page, `"input"` from Inputs. */
  lineKind: "produce" | "input";
  unitPriceBdt: number;
  totalAmountBdt: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  /**
   * Where the money is. `'Released to Farmer'` is what makes
   * `paymentStatus === "paid"` true — the field is derived from it server-side
   * in `toPaymentStatus`, so these two can never disagree.
   */
  escrowStatus: 'Held in Escrow' | 'Released to Farmer' | 'Refunded' | 'Disputed';
  /** `YYYY-MM-DD` the held funds auto-release on; `""` when no clock is running. */
  escrowReleaseAt: string;
  placedAt: string;
  deliveryAddress: string;
  estimatedDelivery: string;
  deliveredAt?: string;
  delivery: {
    consignmentNo: string;
    vehicle: string;
    driverName: string;
    status: DeliveryStatus;
    events: Array<{ status: DeliveryStatus; note: string; at: string }>;
  } | null;
  trackingSteps: Array<{
    label: string;
    date: string;
    done: boolean;
  }>;
}

export interface BuyerDemand {
  id: string;
  buyerName: string;
  productName: string;
  variety?: string;
  quantityKg: number;
  qualityGrade: QualityGrade | "Any";
  maxPricePerKgBdt: number;
  preferredLocation: string;
  deliveryMethod: "pickup" | "delivery";
  deadline: string;
  status: DemandStatus;
  postedAt: string;
  matchedFarmers: number;
  description: string;
}

export interface BuyerPayment {
  id: string;
  transactionRef: string;
  orderCode: string;
  produceName: string;
  amountBdt: number;
  method: "bKash" | "Nagad" | "Rocket" | "Card" | "Bank Transfer";
  status: "completed" | "pending" | "failed" | "refunded";
  paidAt: string;
}

export interface BuyerDashboardStats {
  activeOrders: number;
  totalOrdersAllTime: number;
  totalSpentBdt: number;
  openDemands: number;
  savedListings: number;
  recentOrders: BuyerOrder[];
}

export interface MarketplaceFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  district?: string;
  grade?: QualityGrade;
  verifiedOnly?: boolean;
  search?: string;
}

// ─── API functions ─────────────────────────────────────────────

/** Browse produce — optional filters, executed server-side by
 *  `GET /api/marketplace/listings`. The endpoint is public (no token needed)
 *  and returns only `Approved` listings. */
export async function getProduceListings(
  filters?: MarketplaceFilters
): Promise<ApiResponse<ProduceListing[]>> {
  const params = new URLSearchParams();

  if (filters?.search) params.set("search", filters.search);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.grade) params.set("grade", filters.grade);
  if (filters?.district) params.set("district", filters.district);
  if (filters?.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters?.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters?.verifiedOnly) params.set("verifiedOnly", "1");

  const qs = params.toString();
  try {
    const data = await api.get<ProduceListing[]>(
      `/marketplace/listings${qs ? `?${qs}` : ""}`
    );
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail([], err instanceof Error ? err.message : "Could not load listings.");
  }
}

/** Single listing. Returns `success: false` for a 404 (unapproved or unknown
 *  id) so the detail page can render its not-found state. */
export async function getProduceById(
  id: string
): Promise<ApiResponse<ProduceListing | null>> {
  try {
    const data = await api.get<ProduceListing>(`/marketplace/listings/${id}`);
    return ok(data);
  } catch (err) {
    return fail(
      null,
      err instanceof Error ? err.message : "Listing not found."
    );
  }
}

/**
 * The caller's own produce listings, whatever state moderation left them in.
 *
 * Requires a session — this is what backs the My Listings page, so a supplier
 * can see a rejected listing and fix it rather than wondering where it went.
 */
export async function getMyProduceListings(): Promise<
  ApiResponse<ProduceListing[]>
> {
  try {
    const data = await api.get<ProduceListing[]>("/marketplace/listings/mine");
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail([], err instanceof Error ? err.message : "Could not load your listings.");
  }
}

/**
 * The caller's saved shelf — full listings, newest heart first.
 *
 * The server filters to `Approved` rows so this page never shows a lot a
 * buyer can no longer order; a listing that gets un-published disappears from
 * the shelf but keeps its row, so re-approval restores the heart exactly as it
 * was left. This is also what the dashboard counts, which is what keeps the
 * badge and the page in agreement.
 */
export async function getSavedListings(): Promise<ApiResponse<ProduceListing[]>> {
  try {
    const data = await api.get<ProduceListing[]>("/marketplace/saved");
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail([], err instanceof Error ? err.message : "Could not load your saved listings.");
  }
}

/**
 * Heart or un-heart a listing, mirroring the server's `saved` flag back out so
 * a caller holding a stale card can correct itself without refetching.
 *
 * Errors are *not* swallowed here: a 401 (not signed in) or a 404 (lot
 * withdrawn) comes back as `success: false` with `saved` reverted, so the UI
 * can put the heart back and say why instead of leaving it lit for a listing
 * that was never saved.
 */
export async function setListingSaved(
  id: string,
  saved: boolean
): Promise<ApiResponse<{ saved: boolean; listingId: string }>> {
  const reverted = { saved: !saved, listingId: id };
  try {
    const data = saved
      ? await api.post<{ saved: boolean; listingId: string }>(
          // Empty body by design: the listing id comes from the path and the
          // owner from the token, and the server reads nothing else, so there
          // is nothing to forge.
          `/marketplace/saved/${id}`,
          {}
        )
      : await api.delete<{ saved: boolean; listingId: string }>(
          `/marketplace/saved/${id}`
        );
    return ok(data);
  } catch (err) {
    return fail(
      reverted,
      err instanceof Error ? err.message : "Could not update your saved listings."
    );
  }
}

/**
 * Submit a rating + comment for a produce listing.
 *
 * Whole numbers 1–5 and a comment of 10–2000 characters are enforced
 * server-side (`ratingValidation`); the returned summary is the recomputed
 * one, so the detail page can update its header without a second fetch. A
 * duplicate rating or an expired session surfaces as `success: false` with
 * the server's message — callers toast it rather than optimistically
 * pretending the rating landed.
 */
export async function submitProduceRating(
  listingId: string,
  rating: number,
  comment: string
): Promise<ApiResponse<{ averageRating: number; totalRatings: number }>> {
  try {
    const data = await api.post<{ averageRating: number; totalRatings: number }>(
      `/marketplace/listings/${listingId}/rating`,
      { rating, comment }
    );
    return ok(data);
  } catch (err) {
    return fail(
      { averageRating: 0, totalRatings: 0 },
      err instanceof Error ? err.message : "Could not submit your rating."
    );
  }
}

/** Every review on a listing, newest first — public, no token needed. */
export async function getProduceRatings(
  listingId: string
): Promise<ApiResponse<RatingItem[]>> {
  try {
    const data = await api.get<RatingItem[]>(`/marketplace/listings/${listingId}/ratings`);
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail([], err instanceof Error ? err.message : "Could not load reviews.");
  }
}

/**
 * What the My Listings form submits, in the vocabulary the server stores.
 *
 * Deliberately database-side names (`produceName`, `askingPricePerKg`) rather
 * than the `ProduceListing` display names — validation, the model and the
 * admin mappers all read this spelling, and translating here once is cheaper
 * than translating at every call site.
 *
 * `status` and `isVerified` are absent on purpose: the server rejects them
 * from everyone except an admin, loudly rather than by silently dropping.
 *
 * `qualityGrade` is absent for the same reason in reverse — a seller may not
 * declare their own grade. New listings start at `"Pending Inspection"` and
 * only the quality module writes a real one.
 *
 * `imageUrl` is required: it carries the absolute URL returned by
 * `uploadListingImage`, and the server rejects a create without it.
 */
export interface ListingPayload {
  produceName: string;
  variety: string;
  category: string;
  quantityAvailableKg: number;
  askingPricePerKg: number;
  minimumOrderKg: number;
  description: string;
  imageUrl: string;
  harvestDate: string;
  availableUntil: string;
  location: string;
  district: string;
  tags: string[];
  storageCondition: string;
  lotCode: string;
  certification: string;
  sampleAvailable: boolean;
  availableFrom: string;
}

/**
 * Upload a produce photo.
 *
 * Called *before* the listing exists — the New-listing form needs a URL to
 * put in `imageUrl` on the very first save, so the upload cannot hang off a
 * listing id. Field name `"image"` matches `upload.single("image")`.
 */
export async function uploadListingImage(
  file: File
): Promise<ApiResponse<string>> {
  try {
    const res = await uploadFile<{ url: string }>(
      "/marketplace/upload",
      file,
      "image"
    );
    if (!res?.url) return fail("", "The upload did not return an image URL.");
    return ok(res.url);
  } catch (err) {
    return fail(
      "",
      err instanceof Error ? err.message : "Could not upload the image."
    );
  }
}

export async function createListing(
  payload: ListingPayload
): Promise<ApiResponse<ProduceListing | null>> {
  try {
    return ok(await api.post<ProduceListing>("/marketplace/listings", payload));
  } catch (err) {
    return fail(null, err instanceof Error ? err.message : "Could not create the listing.");
  }
}

export async function updateListing(
  id: string,
  payload: Partial<ListingPayload>
): Promise<ApiResponse<ProduceListing | null>> {
  try {
    return ok(
      await api.put<ProduceListing>(`/marketplace/listings/${id}`, payload)
    );
  } catch (err) {
    return fail(null, err instanceof Error ? err.message : "Could not update the listing.");
  }
}

export async function deleteListing(
  id: string
): Promise<ApiResponse<{ id: string } | null>> {
  try {
    return ok(await api.delete<{ id: string }>(`/marketplace/listings/${id}`));
  } catch (err) {
    return fail(null, err instanceof Error ? err.message : "Could not delete the listing.");
  }
}

/**
 * Ask for the lot to be inspected — Phase 2 of the marketplace plan.
 *
 * The grade is the inspector's to give, so the seller's only lever is this:
 * it opens an *unassigned* `QualityRequest` that any inspector can claim, and
 * the listing keeps reading `"Pending Inspection"` until one of them submits
 * a report (which is also what unlocks the admin's Approve button).
 *
 * 409 means a request is already open — the caller should render the waiting
 * state rather than treating it as a failure.
 */
export async function requestListingInspection(
  listingId: string
): Promise<ApiResponse<{ id: string } | null>> {
  try {
    const created = await api.post<{ id: string }>(
      `/quality/listing/${listingId}`,
      {}
    );
    return ok(created);
  } catch (err) {
    return fail(
      null,
      err instanceof Error ? err.message : "Could not request the inspection."
    );
  }
}

/** Buyer dashboard KPIs, derived from the live orders, demands and shelf. */
export async function getBuyerDashboardStats(): Promise<
  ApiResponse<BuyerDashboardStats>
> {
  const [ordersRes, demandsRes, savedRes] = await Promise.all([
    getBuyerOrders(),
    // Own demands only — without `mine` this returns the whole public board
    // and would inflate the KPI with other buyers' requests.
    getBuyerDemands({ mine: true }),
    // Counted here rather than by a headless `countDocuments` so the hero
    // badge and the saved page can never disagree: both go through the same
    // Approved-only query, so a lot that is currently un-published counts
    // exactly as many times on each.
    getSavedListings(),
  ]);

  const zero: BuyerDashboardStats = {
    activeOrders: 0,
    totalOrdersAllTime: 0,
    totalSpentBdt: 0,
    openDemands: 0,
    savedListings: 0,
    recentOrders: [],
  };

  if (!ordersRes.success || !demandsRes.success || !savedRes.success) {
    return fail(
      zero,
      ordersRes.message ||
        demandsRes.message ||
        savedRes.message ||
        "Could not load your dashboard."
    );
  }

  const orders = ordersRes.data;
  const demands = demandsRes.data;

  return ok({
    activeOrders: orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled"
    ).length,
    totalOrdersAllTime: orders.length,
    // Cancelled orders are excluded rather than only counting escrow-released
    // ones: escrow only clears when an admin acts, so restricting to
    // `paymentStatus === "paid"` would report ৳0 for every new account.
    totalSpentBdt: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.totalAmountBdt, 0),
    openDemands: demands.filter((d) => d.status === "open").length,
    savedListings: savedRes.data.length,
    recentOrders: orders.slice(0, 3),
  });
}

export async function getBuyerOrders(): Promise<ApiResponse<BuyerOrder[]>> {
  try {
    const data = await api.get<BuyerOrder[]>("/orders");
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail([], err instanceof Error ? err.message : "Could not load orders.");
  }
}

/**
 * The seller's half of the same records: every order whose listing (or input
 * product) this account owns, not the ones it placed.
 *
 * The payload is deliberately identical to `BuyerOrder` — `mapBuyerOrder`
 * emits amounts and `escrowStatus` for whoever is looking, so a seller reads
 * its own money out of `totalAmountBdt` + `escrowStatus` exactly as a buyer
 * does, and the two pages can share badge maps and formatting.
 */
export async function getSalesOrders(): Promise<ApiResponse<BuyerOrder[]>> {
  try {
    const data = await api.get<BuyerOrder[]>("/orders/sales");
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail(
      [],
      err instanceof Error ? err.message : "Could not load your sales."
    );
  }
}

export async function getOrderById(
  id: string
): Promise<ApiResponse<BuyerOrder | null>> {
  try {
    const data = await api.get<BuyerOrder>(`/orders/${id}`);
    return ok(data);
  } catch (err) {
    return fail(null, err instanceof Error ? err.message : "Order not found.");
  }
}

/** Reasons a buyer can raise; mirrors the `disputeRules()` enum server-side. */
export type DisputeReason =
  | "Order Not Received"
  | "Produce Grade Degradation"
  | "Moisture Mismatch"
  | "Delivery Transit Spoilage"
  | "Weight Shortage"
  | "Payment Delay";

export const DISPUTE_REASONS: DisputeReason[] = [
  "Order Not Received",
  "Produce Grade Degradation",
  "Moisture Mismatch",
  "Delivery Transit Spoilage",
  "Weight Shortage",
  "Payment Delay",
];

/**
 * Buyer confirms the goods arrived — releases escrow to the seller.
 *
 * The 409 for "already released" surfaces here like any other failure, so a
 * double-click or a stale tab shows a message rather than pretending to work.
 */
export async function confirmOrderReceipt(
  id: string
): Promise<ApiResponse<BuyerOrder | null>> {
  try {
    const data = await api.post<BuyerOrder>(`/orders/${id}/receipt`, {});
    return ok(data);
  } catch (err) {
    return fail(null, err instanceof Error ? err.message : "Could not confirm receipt.");
  }
}

/**
 * Buyer opens a dispute, which freezes held escrow until an admin resolves
 * the case. Returns the updated order so the page can re-render in one round
 * trip.
 */
export async function openOrderDispute(
  id: string,
  input: { reason?: DisputeReason; note?: string }
): Promise<ApiResponse<BuyerOrder | null>> {
  try {
    const data = await api.post<BuyerOrder>(`/orders/${id}/dispute`, {
      reason: input.reason,
      note: input.note,
    });
    return ok(data);
  } catch (err) {
    return fail(null, err instanceof Error ? err.message : "Could not open the dispute.");
  }
}

/**
 * Every case this account opened, newest first — the read-only shelf behind
 * `/dashboard/disputes`.
 *
 * Scoped server-side by the order's owner, so it is the same list the seller
 * portals would use if they could open cases: one caller, one truth, no
 * client-side filtering of a set the server already narrowed. Admin does not
 * come here; it reads the whole board through `getDisputesAdmin`.
 */
export async function getMyDisputes(): Promise<ApiResponse<DisputeCase[]>> {
  try {
    return ok(await api.get<DisputeCase[]>("/orders/mine/disputes"));
  } catch (err) {
    return fail([], err instanceof Error ? err.message : "Could not load your cases.");
  }
}

/**
 * Demand board.
 *
 * No argument → the public board: every demand still open to an answer. That
 * is what anonymous visitors to `/marketplace/demands` see too.
 * `{ mine: true }` → this account's own demands regardless of status, which
 * is what the buyer portal's "Mine" tab and its dashboard KPIs need.
 */
export async function getBuyerDemands(
  opts?: { mine?: boolean }
): Promise<ApiResponse<BuyerDemand[]>> {
  try {
    const data = await api.get<BuyerDemand[]>(
      opts?.mine ? "/demands?mine=1" : "/demands"
    );
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail([], err instanceof Error ? err.message : "Could not load demands.");
  }
}

export async function postDemand(
  data: Omit<BuyerDemand, "id" | "postedAt" | "matchedFarmers" | "status">
): Promise<ApiResponse<BuyerDemand>> {
  try {
    // Field names differ on purpose: the DB keeps `product`/`quantity` (which
    // the farmer board and the Demand model both use), while the frontend
    // interface uses `productName`/`quantityKg`.
    const created = await api.post<BuyerDemand>("/demands", {
      product: data.productName,
      quantity: data.quantityKg,
      variety: data.variety,
      qualityGrade: data.qualityGrade,
      maxPricePerKgBdt: data.maxPricePerKgBdt,
      preferredLocation: data.preferredLocation,
      deliveryMethod: data.deliveryMethod,
      deadline: data.deadline || undefined,
      description: data.description,
    });
    return ok(created);
  } catch (err) {
    return fail(
      null as unknown as BuyerDemand,
      err instanceof Error ? err.message : "Could not post the demand."
    );
  }
}

export async function getBuyerPayments(): Promise<ApiResponse<BuyerPayment[]>> {
  try {
    const data = await api.get<BuyerPayment[]>("/payments");
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail([], err instanceof Error ? err.message : "Could not load payments.");
  }
}

/**
 * Turn the local cart into real orders.
 *
 * `POST /orders/checkout` takes a single listing, so a multi-item cart is
 * placed one line at a time. A cart is only considered placed when every line
 * succeeds — otherwise the caller keeps its cart and the report names the
 * offending line, so nothing is silently half-ordered. The cart itself is
 * only cleared by the caller once this returns `success`.
 */
export async function checkoutCart(
  items: CartItem[],
  deliveryAddress: string,
  paymentMethod: string,
  phone: string,
  notes: string
): Promise<ApiResponse<BuyerOrder[]>> {
  if (!items.length) return fail([], "Your cart is empty.");

  const placed: BuyerOrder[] = [];
  const failures: string[] = [];

  for (const item of items) {
    try {
      placed.push(
        await api.post<BuyerOrder>("/orders/checkout", {
          // One cart, two line kinds — the server dispatches on which id is
          // present and rejects a body carrying both or neither.
          ...(item.kind === "input"
            ? { productId: item.productId }
            : { listingId: item.listingId }),
          quantityKg: item.quantityKg,
          deliveryAddress,
          paymentMethod,
          phone,
          notes,
        })
      );
    } catch (err) {
      failures.push(
        `${item.cropName}: ${err instanceof Error ? err.message : "order failed"}`
      );
    }
  }

  if (failures.length) {
    return fail(
      placed,
      placed.length
        ? `${failures.join("; ")} — ${placed.length} of ${items.length} line(s) were placed.`
        : failures.join("; ")
    );
  }

  return ok(placed);
}

// ─── Stripe Checkout (test mode) ─────────────────────────────

/** What `POST /orders/stripe-checkout` returns: the hosted page to go to. */
export interface StripeCheckoutInit {
  sessionId: string;
  sessionUrl: string;
  orders: string[];
}

/** Backend-verified state of a Stripe Checkout Session, read after the buyer
 *  returns. The backend verifies with Stripe directly if the webhook has not
 *  stamped the order yet; the `?success=1` URL param alone is never trusted. */
export interface StripeCheckoutStatus {
  confirmed: boolean;
  status: "paid" | "open" | "complete" | "expired" | string;
  paymentStatus: string;
  totalAmountBdt: number;
  orders: Array<{
    orderCode: string;
    status: string;
    escrowStatus: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPriceBdt: number;
    totalAmountBdt: number;
  }>;
}

/**
 * Start a Stripe-hosted Checkout for the whole cart. Unlike `checkoutCart`,
 * every line is sent in ONE request so one Checkout Session covers the full
 * basket. Prices, stock and minimums are all re-validated server-side; the
 * client only supplies item ids and quantities. The returned `sessionUrl` is
 * a `checkout.stripe.com` page the browser should navigate to; the cart is
 * intentionally NOT cleared here — it is wiped on the success return only
 * after `getStripeCheckoutStatus` confirms the charge.
 */
export async function createStripeCheckout(
  items: CartItem[],
  deliveryAddress: string,
  phone: string,
  notes: string
): Promise<ApiResponse<StripeCheckoutInit | null>> {
  if (!items.length) return fail(null, "Your cart is empty.");
  try {
    const data = await api.post<StripeCheckoutInit>("/orders/stripe-checkout", {
      items: items.map((i) => ({
        ...(i.kind === "input"
          ? { productId: i.productId }
          : { listingId: i.listingId }),
        quantityKg: i.quantityKg,
      })),
      deliveryAddress,
      phone,
      notes,
    });
    return ok(data);
  } catch (err) {
    return fail(
      null,
      err instanceof Error ? err.message : "Could not start Stripe checkout."
    );
  }
}

/** Read the backend's verified payment state for a returned Stripe session. */
export async function getStripeCheckoutStatus(
  sessionId: string
): Promise<ApiResponse<StripeCheckoutStatus | null>> {
  try {
    const data = await api.get<StripeCheckoutStatus>(
      `/orders/stripe-checkout/${sessionId}`
    );
    return ok(data);
  } catch (err) {
    return fail(
      null,
      err instanceof Error ? err.message : "Could not check the payment status."
    );
  }
}

// ─── Cart persistence ────────────────────────────────────────
// localStorage only by design — see the plan's Architecture Decisions table.

const CART_KEY = "farmPath_cart";

/** `produce:<listingId>` / `input:<productId>` — see `CartItem.lineId`. */
export function lineIdOf(kind: CartLineKind, refId: string): string {
  return `${kind}:${refId}`;
}

/**
 * Read the cart, repairing anything written before input lines existed.
 *
 * A legacy entry has no `kind`, no `lineId` and no `unitLabel`. Rather than
 * dropping the buyer's basket on the floor we fill the defaults in — that is
 * exactly what those values were when the entry was written.
 */
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(isCartLine);
  } catch {
    return [];
  }
}

function isCartLine(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Partial<CartItem>;
  if (typeof line.cropName !== "string") return false;
  if (typeof line.listingId !== "string") return false;
  // Legacy produce lines have none of the discriminator fields.
  const kind: CartLineKind = line.kind === "input" ? "input" : "produce";
  const refId = kind === "input" ? String(line.productId ?? "") : line.listingId;
  if (kind === "input" && !refId) return false;

  Object.assign(line, {
    kind,
    lineId: lineIdOf(kind, refId),
    unitLabel: line.unitLabel || (kind === "input" ? "unit" : "kg"),
    quantityKg: Number(line.quantityKg) || 1,
    pricePerKgBdt: Number(line.pricePerKgBdt) || 0,
  });
  return true;
}

/** Fired by `saveCart`. Listen with `onCartCountChange`. */
export const CART_EVENT = "farmpath:cart";

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  // Same-tab listeners: `storage` only fires in *other* tabs, and the site
  // navbar badge needs to move the moment a line is added here.
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: items.length }));
}

/** Subscribe to cart mutations. Returns the unsubscribe function. */
export function onCartCountChange(handler: (count: number) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<number>).detail;
    handler(typeof detail === "number" ? detail : getCart().length);
  };
  window.addEventListener(CART_EVENT, listener);
  return () => window.removeEventListener(CART_EVENT, listener);
}

export function addToCart(listing: ProduceListing, quantityKg: number): CartItem[] {
  const cart = getCart();
  const lineId = lineIdOf("produce", listing.id);
  const existingIdx = cart.findIndex((i) => i.lineId === lineId);
  if (existingIdx >= 0) {
    cart[existingIdx].quantityKg += quantityKg;
  } else {
    cart.push({
      lineId,
      kind: "produce",
      listingId: listing.id,
      cropName: listing.cropName,
      variety: listing.variety,
      farmerName: listing.farmerName,
      pricePerKgBdt: listing.pricePerKgBdt,
      quantityKg,
      imageUrl: listing.imageUrl,
      qualityGrade: listing.qualityGrade,
      unitLabel: "kg",
    });
  }
  saveCart(cart);
  return cart;
}

/**
 * Put a farm input in the basket. Mirrors `addToCart` so the two reads the
 * same way in the detail pages: price is per unit, quantity is in units, and
 * the stock/MOQ ceilings ride along so the cart can refuse a bad number
 * before the server does.
 */
export function addInputToCart(product: SupplierProduct, quantity: number): CartItem[] {
  const cart = getCart();
  const lineId = lineIdOf("input", product.id);
  const existingIdx = cart.findIndex((i) => i.lineId === lineId);
  if (existingIdx >= 0) {
    cart[existingIdx].quantityKg += quantity;
  } else {
    cart.push({
      lineId,
      kind: "input",
      listingId: "",
      productId: product.id,
      cropName: product.productName,
      variety: product.category,
      farmerName: product.supplierName,
      pricePerKgBdt: product.pricePerUnitBdt,
      quantityKg: quantity,
      imageUrl: product.imageUrl,
      qualityGrade: "Grade A",
      unitLabel: product.unit,
      maxQuantity: product.stockQuantity,
      minimumOrder: product.minimumOrderQuantity,
    });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(lineId: string): CartItem[] {
  const updated = getCart().filter((i) => i.lineId !== lineId);
  saveCart(updated);
  return updated;
}

export function clearCart(): void {
  saveCart([]);
}
