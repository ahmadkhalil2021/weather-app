"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { localeAtom } from "../app/atom";
import { useTranslation } from "../hooks/useTranslation";
import { cn } from "../utils/cn";

const STORAGE_KEY = "locale";

export function LocaleToggle() {
  const [locale, setLocale] = useAtom(localeAtom);
  const { t } = useTranslation();

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if ((stored === "en" || stored === "de") && stored !== locale) {
        setLocale(stored);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change + sync <html lang>.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="relative inline-flex h-8 shrink-0 items-center rounded-full bg-gray-200/80 dark:bg-gray-800 p-0.5"
    >
      {(["en", "de"] as const).map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            aria-label={option === "en" ? t("switchToEnglish") : t("switchToGerman")}
            onClick={() => setLocale(option)}
            className={cn(
              "relative inline-flex h-7 w-9 items-center justify-center rounded-full text-xs font-bold uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
              active
                ? "bg-blue-500 text-white shadow"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}