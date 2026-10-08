"use client";

import ErrorPage from "@/components/ui/ErrorPage";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body>
        <LanguageProvider>
          <ErrorPage errorCode="500" errorMessage={error.message} onRetry={reset} />
        </LanguageProvider>
      </body>
    </html>
  );
}
