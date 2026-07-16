"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { themeAtom } from "../app/atom";
import { useTranslation } from "../hooks/useTranslation";
import { cn } from "../utils/cn";

const STORAGE_KEY = "theme";

export function ThemeToggle() {
  const [theme, setTheme] = useAtom(themeAtom);
  const { t } = useTranslation();

  // Hydrate the atom from localStorage on first mount (handles reloads).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        if (stored !== theme) setTheme(stored);
        return;
      }
      // No stored value yet – honor system preference once.
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark && theme !== "dark") setTheme("dark");
    } catch {
      // localStorage may be unavailable (e.g. during SSR or in private mode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync the .dark class on <html> and persist every theme change.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? t("switchToLight") : t("switchToDark")}
      title={isDark ? t("switchToLight") : t("switchToDark")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500",
        isDark ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
      )}
    >
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out",
          isDark
            ? "translate-x-7 text-gray-900"
            : "translate-x-1 text-yellow-500"
        )}
      >
        {isDark ? <MdDarkMode size={14} /> : <MdLightMode size={14} />}
      </span>
    </button>
  );
}