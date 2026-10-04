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

import { ApiResponse, SupplierProduct } from "@/types";
import { api } from "@/lib/api";

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

export type QualityGrade = "Grade A" | "Grade B" | "Grade C";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "quality_check"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded";
export type DemandStatus = "open" | "matched" | "fulfilled" | "expired";

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
  /**
   * Moderation state — `"Approved"` / `"Pending Review"` / `"Rejected"`.
   *
   * Optional because only the moderator and the owner's own-listings view are
   * supposed to care about it; the public browse list returns it too but the
   * server has already filtered that to approved rows.
   */
  status?: string;
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
  placedAt: string;
  deliveryAddress: string;
  estimatedDelivery: string;
  deliveredAt?: string;
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
 * What the My Listings form submits, in the vocabulary the server stores.
 *
 * Deliberately database-side names (`produceName`, `askingPricePerKg`) rather
 * than the `ProduceListing` display names — validation, the model and the
 * admin mappers all read this spelling, and translating here once is cheaper
 * than translating at every call site.
 *
 * `status` and `isVerified` are absent on purpose: the server rejects them
 * from everyone except an admin, loudly rather than by silently dropping.
 * An empty `imageUrl` is legal too — the mapper substitutes a placeholder.
 */
export interface ListingPayload {
  produceName: string;
  variety: string;
  category: string;
  quantityAvailableKg: number;
  askingPricePerKg: number;
  minimumOrderKg: number;
  qualityGrade: QualityGrade;
  description: string;
  imageUrl: string;
  harvestDate: string;
  availableUntil: string;
  location: string;
  district: string;
  tags: string[];
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

/** Buyer dashboard KPIs, derived from the live orders and demands. */
export async function getBuyerDashboardStats(): Promise<
  ApiResponse<BuyerDashboardStats>
> {
  const [ordersRes, demandsRes] = await Promise.all([
    getBuyerOrders(),
    // Own demands only — without `mine` this returns the whole public board
    // and would inflate the KPI with other buyers' requests.
    getBuyerDemands({ mine: true }),
  ]);

  const zero: BuyerDashboardStats = {
    activeOrders: 0,
    totalOrdersAllTime: 0,
    totalSpentBdt: 0,
    openDemands: 0,
    savedListings: 0,
    recentOrders: [],
  };

  if (!ordersRes.success || !demandsRes.success) {
    return fail(
      zero,
      ordersRes.message || demandsRes.message || "Could not load your dashboard."
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
    savedListings: 0,
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
  paymentMethod: string
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
