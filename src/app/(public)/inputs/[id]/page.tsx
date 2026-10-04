import { LoginGate } from "@/features/auth/LoginGate";
import { InputDetail } from "@/features/marketplace/inputs/InputDetail";

/**
 * `/inputs/:id` — farm-input detail.
 *
 * Anonymous visitors are bounced to `/login?next=/inputs/:id` by `LoginGate`
 * before any of the product loads, matching `/products/:id`.
 */
export default async function InputDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <LoginGate>
      <InputDetail id={id} basePath="/inputs" />
    </LoginGate>
  );
}
