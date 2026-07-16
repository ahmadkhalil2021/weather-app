"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { MdClose } from "react-icons/md";
import { placeAtom } from "../app/atom";
import { useTranslation } from "../hooks/useTranslation";
import { useFavorites, useRecents } from "../hooks/useCityLists";
import { cn } from "../utils/cn";

interface FavoritesChipsProps {
  /** Called after a chip click changes the place. Used by the mobile drawer
   *  to close itself; desktop navbar omits this. */
  onPlaceChange?: () => void;
}

export function FavoritesChips({ onPlaceChange }: FavoritesChipsProps) {
  const { t } = useTranslation();
  const { favorites, removeFavorite } = useFavorites();
  const { recents, pushRecent, removeRecent } = useRecents();
  const place = useAtomValue(placeAtom);
  const setPlace = useSetAtom(placeAtom);

  // A favorite never also appears as a recent — that would render the same
  // city twice (blue favorite + glass recent) with the same React key.
  const recentsOnly = recents.filter((c) => !favorites.includes(c));

  if (favorites.length === 0 && recentsOnly.length === 0) return null;

  const handleFavoriteClick = (city: string) => {
    setPlace(city);
    onPlaceChange?.();
  };

  const handleRecentClick = (city: string) => {
    setPlace(city);
    pushRecent(city); // bump to front of recents
    onPlaceChange?.();
  };

  return (
    <div
      role="group"
      aria-label={`${t("favorites")} / ${t("recent")}`}
      className="flex gap-2 overflow-x-auto no-scrollbar items-center py-2 px-4 w-full max-w-7xl mx-auto"
    >
      {favorites.map((city) => (
        <Chip
          key={`fav-${city}`}
          city={city}
          isActive={place === city}
          section={t("favorites")}
          onClick={() => handleFavoriteClick(city)}
          onRemove={() => removeFavorite(city)}
        />
      ))}
      {favorites.length > 0 && recentsOnly.length > 0 && (
        <div
          aria-hidden="true"
          className="w-px h-6 bg-gray-300/70 dark:bg-gray-600/70 mx-1 shrink-0"
        />
      )}
      {recentsOnly.map((city) => (
        <Chip
          key={`rec-${city}`}
          city={city}
          isActive={place === city}
          section={t("recent")}
          onClick={() => handleRecentClick(city)}
          onRemove={() => removeRecent(city)}
        />
      ))}
    </div>
  );
}

interface ChipProps {
  city: string;
  isActive: boolean;
  section: string;
  onClick: () => void;
  onRemove: () => void;
}

function Chip({ city, isActive, section, onClick, onRemove }: ChipProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-all shrink-0",
        isActive
          ? "bg-blue-500 text-white shadow"
          : "glass-soft hover:bg-white/40 dark:hover:bg-gray-800/40 text-gray-800 dark:text-gray-200"
      )}
    >
      <button
        type="button"
        aria-label={`${section}: ${city}`}
        aria-current={isActive ? "true" : undefined}
        onClick={onClick}
        className="cursor-pointer focus:outline-none focus-visible:underline truncate max-w-[14ch]"
      >
        {city}
      </button>
      <button
        type="button"
        aria-label={`Remove ${city}`}
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
      >
        <MdClose size={14} />
      </button>
    </div>
  );
}
