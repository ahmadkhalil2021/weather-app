/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "date-fns";
import { format, parseISO } from "date-fns";
import { Container } from "./Container";
import { convertTemp } from "../utils/convertKelvinToCelsius";

export interface HourlyForecastItem {
  dt: number;
  dt_txt: string;
  main: { temp: number };
  weather: ReadonlyArray<{ icon: string; description: string }>;
}

type Props = {
  list: ReadonlyArray<HourlyForecastItem>;
  dateLocale: Locale;
  unit: "C" | "F";
  /** OpenWeatherMap icon scale — "2x" or "4x". */
  iconSize?: "2x" | "4x";
};

export function TodayHourlyStrip({
  list,
  dateLocale,
  unit,
  iconSize = "2x",
}: Props) {
  const iconSuffix = iconSize === "4x" ? "@4x.png" : "@2x.png";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // How many "viewport pages" the strip has — recomputed on mount, when the list
  // changes, and on window resize (so a rotation / window toggle updates).
  const recalcPages = useCallback(() => {
    const el = scrollRef.current;
    if (!el || list.length === 0) {
      setTotalPages(0);
      return;
    }
    const pages = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth));
    setTotalPages(pages);
  }, [list]);

  // Measure on mount and on window resize. The initial call is wrapped in
  // requestAnimationFrame so the setState isn't synchronous inside the effect
  // body — `react-hooks/set-state-in-effect` expects state updates to come
  // from an event or scheduled task, not directly from inside an effect
  // callback. Cancel the frame on cleanup.
  useEffect(() => {
    const id = requestAnimationFrame(recalcPages);
    window.addEventListener("resize", recalcPages);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", recalcPages);
    };
  }, [recalcPages]);

  // Throttle scroll-driven state updates via requestAnimationFrame so we batch
  // resizes (mobile fling/drag) into one update per frame.
  const handleScroll = () => {
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const next = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
      setActivePage((prev) => (prev === next ? prev : next));
    });
  };

  const scrollToPage = (pageIndex: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      left: pageIndex * el.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <Container className="flex-col gap-3 px-0 py-5 items-stretch">
      {/* Scrollable row */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-stretch gap-6 px-6 overflow-x-auto no-scrollbar snap-x snap-mandatory"
      >
        {list.map((item) => (
          <div
            key={item.dt}
            className="flex flex-col items-center gap-1 min-w-[3.75rem] shrink-0 snap-start"
          >
            <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-200">
              {format(parseISO(item.dt_txt), "HH:mm", { locale: dateLocale })}
            </span>
            <img
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}${iconSuffix}`}
              alt={item.weather[0].description}
              loading="lazy"
              className="w-12 h-12 drop-shadow-sm"
            />
            <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
              {convertTemp(item.main.temp, unit)}°{unit}
            </span>
          </div>
        ))}
      </div>

      {/* Dot indicators — only show when the row actually paginates. */}
      {totalPages > 1 && (
        <nav
          aria-label="Hourly forecast pagination"
          className="flex justify-center items-center gap-2 px-6"
        >
          {Array.from({ length: totalPages }).map((_, i) => {
            const isActive = i === activePage;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Page ${i + 1} of ${totalPages}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => scrollToPage(i)}
                className={
                  "h-2 rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 " +
                  (isActive
                    ? "w-6 bg-gray-700/80 dark:bg-gray-100/90 shadow-sm"
                    : "w-2 glass-soft bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/30")
                }
              />
            );
          })}
        </nav>
      )}
    </Container>
  );
}
