/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  MdMyLocation,
  MdOutlineLocationOn,
  MdWbSunny,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { ThemeToggle } from "./ThemeToggle";
import { UnitToggle } from "./UnitToggle";
import { LocaleToggle } from "./LocaleToggle";
import { SearchBox } from "./SearchBox";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { placeAtom } from "../app/atom";
import { useTranslation } from "../hooks/useTranslation";

export default function Navbar() {
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [place] = useAtom(placeAtom);
  const [, setPlace] = useAtom(placeAtom);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Escape key + body scroll lock while the mobile menu is open.
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  async function handleInputChange(value: string) {
    setCity(value);
    if (value.length >= 3) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${process.env.NEXT_PUBLIC_API_KEY}`
        );
        const suggestions = response.data.list.map((item: any) => item.name);
        setSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (errors) {
        setSuggestions([]);
        setShowSuggestions(false);
        console.error("Error fetching suggestions:", errors);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handSuggestionClick(value: string) {
    setCity(value);
    setShowSuggestions(false);
    setMenuOpen(false); // close mobile menu after picking a city
  }

  function handleOnSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (suggestions.length == 0) {
      setError(t("locationNotFound"));
    } else {
      setError("");
      setShowSuggestions(false);
      setPlace(city);
      setCity("");
      setMenuOpen(false); // close mobile menu after submit
    }
  }

  function handleOnCurrecntLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_API_KEY}`
          )
          .then((res) => {
            setPlace(res.data.name);
            setMenuOpen(false); // close after picking current location
          })
          .catch((err) => {
            console.error("Error fetching current location:", err);
          });
      });
    }
  }

  function handleOnClickWeather() {
    window.location.reload();
  }

  // Reusable section blocks (used in desktop nav AND mobile drawer).
  const SearchSection = (
    <div className="relative w-full max-w-sm">
      <SearchBox
        value={city}
        placeholder={t("search")}
        onChange={(e) => handleInputChange(e.target.value)}
        onSubmit={handleOnSubmit}
      />
      <SuggestionBox
        handSuggestionClick={handSuggestionClick}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        error={error}
      />
    </div>
  );

  const LocationSection = (
    <div className="flex items-center gap-2">
      <MdMyLocation
        title={t("yourCurrentLocation")}
        onClick={handleOnCurrecntLocation}
        className="text-2xl text-blue-500 cursor-pointer hover:scale-110 transition-transform"
      />
      <MdOutlineLocationOn className="text-2xl text-red-500" />
      <span className="text-sm font-medium text-slate-900 dark:text-gray-200 whitespace-nowrap">
        {place}
      </span>
    </div>
  );

  return (
    <>
      <nav className="sticky top-0 left-0 z-30 glass-soft bg-white/70 dark:bg-gray-900/70">
        <div className="h-20 w-full flex items-center max-w-7xl px-4 mx-auto gap-4">
          {/* COLUMN 1: LOGO (left) */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={handleOnClickWeather}
          >
            <p className="text-gray-700 dark:text-gray-100 text-xl font-bold">
              {t("appName")}
            </p>
            <MdWbSunny className="text-yellow-400 text-3xl" />
          </div>

          {/* COLUMN 2: SEARCH (center, desktop only) */}
          <div className="hidden md:flex flex-1 justify-center">
            {SearchSection}
          </div>

          {/* COLUMN 3: ACTIONS (right, desktop only) */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-3">
            {LocationSection}
            <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-700 pl-3">
              <LocaleToggle />
              <ThemeToggle />
              <UnitToggle />
            </div>
          </div>

          {/* MOBILE: hamburger button */}
          <div className="md:hidden flex items-center justify-end ml-auto">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("openMenu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="p-2 text-2xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <MdMenu />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE: backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* MOBILE: slide-in panel */}
      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] glass-strong bg-white/85 dark:bg-gray-900/85 z-50 flex flex-col p-4 md:hidden transform transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={t("closeMenu")}
            className="p-2 text-3xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <MdClose />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto">
          {SearchSection}

          <hr className="border-gray-200 dark:border-gray-800" />

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("location")}
            </span>
            {LocationSection}
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("theme")}
            </span>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("units")}
            </span>
            <UnitToggle />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("language")}
            </span>
            <LocaleToggle />
          </div>
        </div>
      </aside>
    </>
  );
}

function SuggestionBox({
  showSuggestions,
  suggestions,
  handSuggestionClick,
  error,
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handSuggestionClick: (item: string) => void;
  error: string;
}) {
  return (
    <>
      {((showSuggestions && suggestions.length > 1) || error) && (
        <ul className="mb-4 glass-strong bg-white/90 dark:bg-gray-900/90 absolute top-full mt-1 left-0 right-0 rounded-md min-w-50 flex flex-col gap-1 py-2 px-2 z-50">
          {error && suggestions.length < 1 && (
            <li className="text-red-500 p-1">{error}</li>
          )}
          {suggestions.map((item, i) => (
            <li
              className="cursor-pointer p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              key={i}
              onClick={() => handSuggestionClick(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}