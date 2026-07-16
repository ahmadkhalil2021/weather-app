"use client";

import { useCallback } from "react";
import { usePersistentList } from "./usePersistentList";
import { favoritesAtom, recentAtom } from "../app/atom";
import { pushUniqueCity } from "../utils/cityList";

/**
 * Favorites + recents live as primitive string-array atoms in
 * `src/app/atom.ts` so any component can read/write them directly. These
 * hooks wrap them with the dedup-and-cap logic (`pushUniqueCity`) so the
 * UI never has to know about MAX_CITY_LIST or duplicate handling.
 */
export function useFavorites() {
  const [favorites, setFavorites] = usePersistentList(
    favoritesAtom,
    "favorites"
  );

  const toggleFavorite = useCallback(
    (city: string) => {
      setFavorites((prev) => {
        const isCurrentlyFavorite = prev.includes(city);
        return isCurrentlyFavorite
          ? prev.filter((c) => c !== city)
          : pushUniqueCity(prev, city);
      });
    },
    [setFavorites]
  );

  const removeFavorite = useCallback(
    (city: string) =>
      setFavorites((prev) => prev.filter((c) => c !== city)),
    [setFavorites]
  );

  const isFavorite = useCallback(
    (city: string) => favorites.includes(city),
    [favorites]
  );

  return { favorites, toggleFavorite, removeFavorite, isFavorite };
}

export function useRecents() {
  const [recents, setRecents] = usePersistentList(recentAtom, "recents");

  const pushRecent = useCallback(
    (city: string) => {
      setRecents((prev) => pushUniqueCity(prev, city));
    },
    [setRecents]
  );

  const removeRecent = useCallback(
    (city: string) => setRecents((prev) => prev.filter((c) => c !== city)),
    [setRecents]
  );

  return { recents, pushRecent, removeRecent };
}
