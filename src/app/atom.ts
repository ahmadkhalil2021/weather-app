import { atom } from "jotai";

export const placeAtom = atom("London");
export const themeAtom = atom<"light" | "dark">("light");
export const unitAtom = atom<"C" | "F">("C");
export const localeAtom = atom<"en" | "de">("en");
export const favoritesAtom = atom<string[]>([]);
export const recentAtom = atom<string[]>([]);