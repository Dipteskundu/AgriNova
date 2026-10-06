"use client";

import { useLanguage } from "@/contexts/LanguageContext";

/**
 * One bilingual helper for the whole dashboard kit.
 *
 * The codebase currently carries three i18n styles: `t('dictKey')` from
 * `LanguageContext`, a locally-scoped `t(bn, en)` arrow function, and
 * `tr(string)` from `localize`. Dashboards written against this hook use the
 * `(bn, en)` signature everywhere, so new screens never have to decide which
 * of the three to reach for — English-only copy is passed as `t("Same", "Same")`.
 */
export function useT() {
  const { language } = useLanguage();
  return (bn: string, en: string) => (language === "bn" ? bn : en);
}
