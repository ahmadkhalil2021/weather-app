"use client";

import { useAtomValue } from "jotai";
import { localeAtom } from "../app/atom";
import { translations, TranslationKey } from "../i18n/translations";

export function useTranslation() {
  const locale = useAtomValue(localeAtom);
  const dict = translations[locale];
  return {
    locale,
    t: (key: TranslationKey): string => dict[key] ?? key,
  };
}