import { LoginGate } from "@/features/auth/LoginGate";
import { ProduceDetail } from "@/features/marketplace/browse/ProduceDetail";

/**
 * `/products/:id` — produce detail.
 *
 * The route itself is public in the sense that anyone may ask for it, but a
 * visitor without a session never sees it: `LoginGate` sends them to
 * `/login?next=/products/:id` and brings them back afterwards. Same rule as
 * `/inputs/:id`, so both halves of the marketplace behave identically.
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <LoginGate>
      <ProduceDetail id={id} basePath="/products" />
    </LoginGate>
  );
}
