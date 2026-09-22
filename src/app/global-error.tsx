"use client";

import ErrorPage from "@/components/ui/ErrorPage";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorPage errorCode="500" errorMessage={error.message} onRetry={reset} />
      </body>
    </html>
  );
}
