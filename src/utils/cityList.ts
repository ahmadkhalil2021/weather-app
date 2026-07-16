export const MAX_CITY_LIST = 5;

/**
 * Move `city` to the front of the list, deduplicating any existing entry, and
 * cap to MAX_CITY_LIST entries. Used by both the favorites and recents atoms —
 * newest at index 0, oldest dropped first.
 */
export function pushUniqueCity(items: string[], city: string): string[] {
  const filtered = items.filter((c) => c !== city);
  return [city, ...filtered].slice(0, MAX_CITY_LIST);
}
