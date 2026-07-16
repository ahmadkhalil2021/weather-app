"use client";

import { useEffect } from "react";
import { PrimitiveAtom, useAtom } from "jotai";

/**
 * Mirror a string-array Jotai atom to localStorage with hydration on mount.
 * Drops invalid payloads (non-array, non-string entries) so a stale
 * localStorage entry from a previous app version can't poison the new state.
 *
 * Returns the same `[list, setList]` tuple as `useAtom` so consumers can
 * write to the atom directly (the persistence effect runs on every change,
 * regardless of which component triggered it).
 */
export function usePersistentList<T extends string[]>(
  atom: PrimitiveAtom<T>,
  key: string
) {
  const [list, setList] = useAtom(atom);

  // Hydrate from localStorage on mount. Wrapped in try/catch for SSR and
  // private-browsing modes where storage access can throw.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (
        Array.isArray(parsed) &&
        parsed.every((entry) => typeof entry === "string")
      ) {
        setList(parsed as T);
      }
    } catch {
      // localStorage may be unavailable — fall back to atom default.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // ignore quota / private-mode failures
    }
  }, [list, key]);

  return [list, setList] as const;
}
