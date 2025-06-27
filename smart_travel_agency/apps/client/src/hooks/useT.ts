import { useTranslation } from "react-i18next";

// Super simple translation hook
// Usage: const t = useT(); then t('nav.dashboard') or t('trip.save')
export function useT() {
  const { t } = useTranslation();
  return t;
}
