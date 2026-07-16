"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { unitAtom } from "../app/atom";
import { useTranslation } from "../hooks/useTranslation";
import { cn } from "../utils/cn";

const STORAGE_KEY = "temp-unit";

export function UnitToggle() {
  const [unit, setUnit] = useAtom(unitAtom);
  const { t } = useTranslation();

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if ((stored === "C" || stored === "F") && stored !== unit) {
        setUnit(stored);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, unit);
    } catch {
      // ignore
    }
  }, [unit]);

  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className="relative inline-flex h-8 shrink-0 items-center rounded-full bg-gray-200/80 dark:bg-gray-800 p-0.5"
    >
      {(["C", "F"] as const).map((option) => {
        const active = option === unit;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            aria-label={option === "C" ? t("switchToCelsius") : t("switchToFahrenheit")}
            onClick={() => setUnit(option)}
            className={cn(
              "relative inline-flex h-7 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
              active
                ? option === "C"
                  ? "bg-blue-500 text-white shadow"
                  : "bg-orange-500 text-white shadow"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            °{option}
          </button>
        );
      })}
    </div>
  );
}