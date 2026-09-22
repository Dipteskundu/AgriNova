"use client";

import ErrorPage from "@/components/ui/ErrorPage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPage errorCode="generic" errorMessage={error.message} onRetry={reset} />;
}
