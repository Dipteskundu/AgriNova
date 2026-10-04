import { InputsBrowser } from "@/features/marketplace/inputs/InputsBrowser";

/**
 * Public farm-input catalogue — `/inputs`.
 *
 * The second half of the marketplace feature: where fertilizer, seed, tools
 * and irrigation kit are listed. Public the same way `/products` is — no
 * session to browse, one required to open a detail page or order.
 */
export default function InputsPage() {
  return <InputsBrowser basePath="/inputs" />;
}
