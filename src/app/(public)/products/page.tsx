import { Suspense } from "react";
import { BrowseProduce } from "@/features/marketplace/browse/BrowseProduce";

/**
 * Public produce catalogue — `/products`.
 *
 * Lives under the `(public)` layout so it renders with the site navbar and is
 * reachable with no session. Browsing the list is open to anyone; opening a
 * single listing is not, which `/products/[id]` enforces.
 *
 * `BrowseProduce` reads the query string via `useSearchParams()`, so it needs
 * a Suspense boundary or the production build refuses to prerender the route.
 */
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="h-9 w-56 animate-pulse rounded-md bg-slate-200 dark:bg-[#222]" />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-[#222] dark:bg-[#111]"
              />
            ))}
          </div>
        </div>
      }
    >
      <BrowseProduce basePath="/products" />
    </Suspense>
  );
}
