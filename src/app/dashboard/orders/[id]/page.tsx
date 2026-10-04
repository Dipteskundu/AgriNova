import { OrderDetail } from "@/features/marketplace/orders/OrderDetail";

/**
 * Single order. Moved from `/marketplace/orders/:id`.
 *
 * `RouteGuard` matches `/dashboard/orders/:id` against the pattern in
 * `MARKETPLACE_ROUTES`, so a buyer can only open their own order here — the
 * server still enforces that independently.
 */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
