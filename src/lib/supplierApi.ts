/**
 * Farm-input catalogue API — the supplier's half of the Inputs feature.
 *
 * Reads and writes `GET/POST/PUT/DELETE /api/products`. `/inputs` is public,
 * so list and detail on the server take no token; the `?mine=1` query and all
 * mutations do. Nothing here is mocked — this module used to hold a hard-coded
 * six-product fixture, which meant the Inputs page would have shown a
 * completely different catalogue from the one a supplier thought they had
 * published.
 *
 * `SupplierProduct` (in `types/index.ts`) is already the shape
 * `mapSupplierProduct` emits, so no transform is needed on the way back.
 * On the way in, `validateProduct` expects the UI spelling of every field
 * (`productName`, `pricePerUnitBdt`, `isAvailable`, …) and converts it to the
 * database enum itself — send the same object back unchanged.
 */
import { ApiResponse, RatingItem, SupplierProduct } from "@/types";
import { api } from "@/lib/api";
import { getBuyerOrders, getMyProduceListings } from "@/lib/marketplaceApi";

/** Re-exported so callers have one import site for an input catalogue row. */
export type { SupplierProduct };

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

function fail<T>(data: T, message: string): ApiResponse<T> {
  return { success: false, data, message, timestamp: new Date().toISOString() };
}

const listMessage = "Could not load your inputs.";
const mutationMessage = "Could not save that change.";

/** What a create/edit form submits — server-owned fields are excluded. */
export type ProductPayload = Omit<
  SupplierProduct,
  "id" | "supplierId" | "supplierName" | "listedAt"
>;

/**
 * Dashboard KPIs.
 *
 * Derived from three real endpoints rather than a dedicated `/stats` route:
 * the supplier's own products, their own produce listings, and the orders
 * they have placed. `inventoryValueBdt` is what the stock on hand is worth at
 * list price — the one figure here that is *not* simply a count of rows.
 */
export interface SupplierDashboardStats {
  /** Inputs with `isAvailable` — what `/inputs` actually shows. */
  activeInputsCount: number;
  /** Approved produce listings owned by this supplier. */
  activeProduceListingsCount: number;
  /** Their own orders that have not arrived or been cancelled. */
  openOrdersCount: number;
  inventoryValueBdt: number;
}

export async function getSupplierDashboardStats(): Promise<
  ApiResponse<SupplierDashboardStats>
> {
  const zero: SupplierDashboardStats = {
    activeInputsCount: 0,
    activeProduceListingsCount: 0,
    openOrdersCount: 0,
    inventoryValueBdt: 0,
  };

  const [productsRes, listingsRes, ordersRes] = await Promise.all([
    getSupplierProducts(),
    getMyProduceListings(),
    getBuyerOrders(),
  ]);

  if (!productsRes.success || !listingsRes.success || !ordersRes.success) {
    return fail(
      zero,
      productsRes.message ||
        listingsRes.message ||
        ordersRes.message ||
        "Could not load your dashboard."
    );
  }

  const products = productsRes.data;
  const listings = listingsRes.data;
  const orders = ordersRes.data;

  return ok({
    activeInputsCount: products.filter((p) => p.isAvailable).length,
    activeProduceListingsCount: listings.filter((l) => l.status === "Approved")
      .length,
    openOrdersCount: orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled"
    ).length,
    inventoryValueBdt: products
      .filter((p) => p.isAvailable)
      .reduce((s, p) => s + p.stockQuantity * p.pricePerUnitBdt, 0),
  });
}

/** This supplier's own inputs — including delisted ones, so they can be edited. */
export async function getSupplierProducts(): Promise<
  ApiResponse<SupplierProduct[]>
> {
  try {
    const data = await api.get<SupplierProduct[]>("/products?mine=1");
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail([], err instanceof Error ? err.message : listMessage);
  }
}

/**
 * The public Inputs catalogue, as `/inputs` sees it. Readable without a
 * token, so it is also how a guest can be told "this supplier lists 4 items".
 */
export async function getPublicInputs(options?: {
  category?: string;
  search?: string;
}): Promise<ApiResponse<SupplierProduct[]>> {
  const params = new URLSearchParams();
  if (options?.category) params.set("category", options.category);
  if (options?.search) params.set("search", options.search);

  const qs = params.toString();
  try {
    const data = await api.get<SupplierProduct[]>(
      `/products${qs ? `?${qs}` : ""}`
    );
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail([], err instanceof Error ? err.message : listMessage);
  }
}

export async function getInputById(
  id: string
): Promise<ApiResponse<SupplierProduct | null>> {
  try {
    const data = await api.get<SupplierProduct>(`/products/${id}`);
    return ok(data);
  } catch (err) {
    return fail(
      null,
      err instanceof Error ? err.message : "Input not found."
    );
  }
}

/**
 * Submit a rating + comment for an input product.
 *
 * Whole numbers 1–5 and a 10–2000 character comment are enforced server-side
 * (`validateRating`); the returned summary is the recomputed one, so the
 * detail page updates its header without a second fetch. A duplicate rating
 * or expired session surfaces as `success: false` with the server's message.
 */
export async function submitInputRating(
  productId: string,
  rating: number,
  comment: string
): Promise<ApiResponse<{ averageRating: number; totalRatings: number }>> {
  try {
    const data = await api.post<{ averageRating: number; totalRatings: number }>(
      `/products/${productId}/rating`,
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

/** Every review on an input product, newest first — public, no token needed. */
export async function getInputRatings(
  productId: string
): Promise<ApiResponse<RatingItem[]>> {
  try {
    const data = await api.get<RatingItem[]>(`/products/${productId}/ratings`);
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail([], err instanceof Error ? err.message : "Could not load reviews.");
  }
}

export async function createProduct(
  data: ProductPayload
): Promise<ApiResponse<SupplierProduct | null>> {
  try {
    return ok(await api.post<SupplierProduct>("/products", data));
  } catch (err) {
    return fail(null, err instanceof Error ? err.message : mutationMessage);
  }
}

export async function updateProduct(
  id: string,
  data: Partial<ProductPayload>
): Promise<ApiResponse<SupplierProduct | null>> {
  try {
    return ok(await api.put<SupplierProduct>(`/products/${id}`, data));
  } catch (err) {
    return fail(null, err instanceof Error ? err.message : mutationMessage);
  }
}

export async function deleteProduct(
  id: string
): Promise<ApiResponse<{ id: string } | null>> {
  try {
    return ok(await api.delete<{ id: string }>(`/products/${id}`));
  } catch (err) {
    return fail(null, err instanceof Error ? err.message : mutationMessage);
  }
}
