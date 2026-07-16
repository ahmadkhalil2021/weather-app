# AGENTS.md — Project Context for AI Assistants

> **Read this file first** when starting a new session on this project. It summarizes architecture, conventions, quirks, and required context to work effectively.

## 1. Project Summary

**Weather App** — a single-page Next.js application that shows current weather and a 5-day forecast for any city, built around the OpenWeatherMap API. Users can search cities (with autocomplete), use their current geolocation, switch between °C/°F, English/German, and light/dark mode. Theme, unit, and locale are persisted in `localStorage`; the searched city is **not** (it resets to the `placeAtom` default on reload).

- **Repository name:** `weather-app`
- **Type:** Client-heavy SPA (no backend, no DB)
- **External dependency:** OpenWeatherMap REST API
- **Locale:** UI strings available in English and German

## 2. Tech Stack

| Layer            | Choice                                       |
| ---------------- | -------------------------------------------- |
| Framework        | **Next.js 16.1.1** (App Router)              |
| UI library       | **React 19.2.3**                             |
| Language         | **TypeScript 5** (`strict: true`)            |
| Styling          | **Tailwind CSS v4** (`@tailwindcss/postcss`) |
| Global state     | **Jotai 2.16** (one atom per UI preference)  |
| Server cache     | **@tanstack/react-query 5.90**               |
| HTTP client      | **axios 1.13**                               |
| Icons            | **react-icons 5.5**                          |
| Class merging    | **clsx + tailwind-merge** (via `src/utils/cn.ts`) |
| Dates            | **date-fns 4.1** + `date-fns/locale`         |
| Lint             | **ESLint 9** + `eslint-config-next`          |
| Fonts            | `next/font/google` — Geist & Geist Mono      |

> Note: `dayjs` is *not* a dependency. All date work goes through `date-fns`.

## 3. Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve production build
npm run lint       # eslint .
```

### Required environment variable

Create a `.env.local` at the project root:

```
NEXT_PUBLIC_API_KEY=<your-openweathermap-api-key>
```

The key is consumed at three call sites (across two files):

- `src/app/page.tsx` — main forecast fetch (`/data/2.5/forecast`)
- `src/components/Navbar.tsx` — city autocomplete (`/data/2.5/find`)
- `src/components/Navbar.tsx` — reverse-geocode (`/data/2.5/weather?lat&lon`)

Without it, requests will fail with a 401 from OpenWeatherMap.

## 4. Project Structure

```
weather-app/
├── AGENTS.md                 ← this file
├── README.md                 ← default Next.js readme (not project info)
├── eslint.config.mjs         ← ESLint flat config
├── next.config.ts            ← empty Next.js config
├── package.json
├── postcss.config.mjs        ← Tailwind v4 PostCSS plugin
├── tsconfig.json             ← "@/*" path alias → "./*"
└── src/
    ├── app/
    │   ├── atom.ts           ← Jotai atoms (place, theme, unit, locale)
    │   ├── globals.css       ← tailwindcss import + dark variant
    │   ├── layout.tsx        ← RootLayout (QueryClientProvider, font, theme/locale inline scripts)
    │   └── page.tsx          ← Home page — fetches & renders forecast
    ├── components/
    │   ├── Container.tsx                  ← Reusable styled wrapper (cn-based)
    │   ├── ForcarWeatherDetails.tsx       ← 5-day forecast row (NOTE: filename has a typo, keep it)
    │   ├── LocaleToggle.tsx               ← EN/DE segmented toggle
    │   ├── Navbar.tsx                     ← Top nav, search, location, mobile drawer
    │   ├── SearchBox.tsx                  ← Search input primitive
    │   ├── ThemeToggle.tsx                ← Light/dark switch
    │   ├── UnitToggle.tsx                 ← °C/°F segmented toggle
    │   └── WeatherDetails.tsx             ← Reusable metric grid (visibility, humidity, wind, etc.)
    ├── hooks/
    │   └── useTranslation.ts              ← Returns { locale, t(key) } backed by Jotai `localeAtom`
    ├── i18n/
    │   └── translations.ts                ← Static `en` + `de` dictionaries, `TranslationKey` type
    └── utils/
        ├── cn.ts                          ← `cn(...inputs)` → tailwind-merge(clsx(...))
        ├── convertKelvinToCelsius.tsx     ← Kelvin → °C / °F; also exports `convertTemp(k, unit)`
        └── meterToKilometer.ts            ← m → km (visibility), m/s → km/h (wind)
```

### Key file purposes

- **`src/app/atom.ts`** — single source of truth for global UI state. Four atoms:
  - `placeAtom` (default `"London"`)
  - `themeAtom` (`"light" | "dark"`)
  - `unitAtom` (`"C" | "F"`)
  - `localeAtom` (`"en" | "de"`)
- **`src/app/layout.tsx`** — wraps the app in `QueryClientProvider`, injects inline `<script>`s in `<head>` to set `.dark` class and `lang` *before* hydration (avoids FOUC/flash of wrong locale). Technically `"use client"` (not a typical layout).
- **`src/app/page.tsx`** — owns the `useQuery` for `/data/2.5/forecast?q=…&cnt=56`, derives "one entry per unique day" for the 5-day forecast section, formats dates with locale-aware `date-fns`.
- **`src/components/Navbar.tsx`** — the busiest component. Handles: search input + OpenWeatherMap `/find` autocomplete, submit-to-`placeAtom`, "use my location" → reverse-geocode via `/weather?lat&lon`, mobile hamburger + slide-in drawer, esc-to-close + body scroll lock.
- **`src/components/WeatherDetails.tsx`** — exports `WeatherDatails` (yes, the export name is misspelled — keep it; only used internally). The `SingleWeatherDetails` helper is **not exported**. Renders the 6-metric grid (visibility / humidity / wind / pressure / sunrise / sunset). Accepts `*Label` props so callers can localize labels via the `useTranslation` hook.
- **`src/components/ForcarWeatherDetails.tsx`** — one row in the 5-day forecast: icon + date + day name + big temp + the same `WeatherDatails` grid. Note: destructure pulls `temp`, `feels_like`, `description` **without** `??` defaults (only `weatherIcon` is fall-backed at the call site).
- **All `*.Toggle.tsx`** — follow the same pattern: hydrate from `localStorage` on mount, persist on change, mirror the value into a side-effect (`.dark` class, `<html lang>`).

## 5. Architecture & Conventions

### 5.1 State management (Jotai)

- One Jotai atom per preference, declared in `src/app/atom.ts`.
- Read with `useAtomValue(atom)`, write with `useAtom(atom)` (the setter tuple convention is fine).
- Each toggle persists itself to `localStorage` with its own key:
  - `theme` → key `"theme"`
  - unit → key `"temp-unit"`
  - locale → key `"locale"`
- Hydration pattern (see `ThemeToggle.tsx`): on mount, read storage → if different from atom, `setAtom(stored)`. Falls back to `prefers-color-scheme` for theme on first visit.

### 5.2 Data fetching (TanStack Query)

- Single query in `src/app/page.tsx`: `queryKey: ["weatherData"]`, `queryFn` uses native `fetch` (not axios).
- A `useEffect([place])` triggers `refetch()` whenever the city changes — query key intentionally *not* parameterized to keep code simple; refetch is explicit.
- Loading/error states render full-page placeholders (localized via `useTranslation`).
- Navbar uses bare `axios` calls directly (not React Query) for autocomplete and reverse-geocoding — light enough not to need caching.

### 5.3 Internationalization

- Static dictionary pattern: `translations.en` and `translations.de` in `src/i18n/translations.ts`.
- **Type-system behavior:** the trailing `as const` makes every literal in `translations.en` and `translations.de` readonly. `TranslationKey = keyof typeof translations.en` only constrains what callers can *type-check* — it does **not** enforce that `de` has the same keys as `en`. Adding a key to English without mirroring it in German will compile, just return the English key as a fallback at runtime. Always update both dictionaries in the same change.
- Access via hook: `const { t, locale } = useTranslation(); t("loading")`.
- Date formatting picks the matching `date-fns` locale object: `locale === "de" ? de : enUS`.
- To add a new language: extend the `translations` object with a new locale (`"fr"`, `"es"`, etc.) and widen `localeAtom` typing in `src/app/atom.ts`, then update `LocaleToggle.tsx` to include the option.

### 5.4 Theming

- Dark mode is driven by the `.dark` class on `<html>` (Tailwind v4 variant declared in `globals.css`: `@variant dark (&:where(.dark, .dark *));`).
- Inline script in `layout.tsx` runs before React hydration to set the class — avoids a theme flash.
- System preference is honored once on first visit if no localStorage value exists.

### 5.5 Styling conventions

- Always use the `cn()` helper from `src/utils/cn.ts` when composing component classes — it correctly resolves Tailwind conflicts via `tailwind-merge`.
- Reusable card chrome lives in `src/components/Container.tsx`. Prefer composing with `<Container className="...">` over reinventing rounded/shadowed wrappers.
- The app background uses a `bg-linear-to-br` gradient: `from-sky-200 via-cyan-100 to-teal-200` (light) / `dark:from-sky-950 via-cyan-950 to-teal-950` — a cool-steel multi-stop palette chosen so the Liquid Glass saturation/blur has obvious color variation to refract against.

### 5.6 Routing

- Single-page app. Future routes would live under `src/app/<route>/page.tsx`.

### 5.7 Rendering mode

- Because `layout.tsx` itself is `"use client"` (so the `QueryClientProvider` can wrap the tree), and `page.tsx` is also `"use client"` (uses hooks/`useQuery`), the app is effectively CSR-first. There is **no** server component rendering meaningful UI, so Next.js static optimization / streaming is not used. If perf/seo becomes a concern, the natural move is: convert `layout.tsx` to a server component, hoist `QueryClientProvider` into a new `src/app/providers.tsx` `"use client"` wrapper, and let `page.tsx` stay client.

### 5.8 Liquid Glass design system

Apple iOS 26-inspired frosted/blur surfaces are applied to the main UI chrome. Three utility classes live in `src/app/globals.css` inside `@layer utilities` — each is **chrome-only** (`backdrop-filter`, `border`, `box-shadow`, `inset` highlight). Critically they do NOT declare `background-color`, so any Tailwind `bg-*` on the same element is the only author of that property and is preserved verbatim. Verified by `Container`'s yellow child: `<Container className="bg-yellow-300/80 ...">` renders a yellow-tinted glass card, not a faux-white one.

| Class | Use case |
| ----- | -------- |
| `.glass` | Default; current-weather, 5-day forecast cards. |
| `.glass-soft` | Sticky top navbar (already translucent). |
| `.glass-strong` | Elevated/foreground surfaces: mobile drawer, search suggestion dropdown. |

Always compose with `bg-{white|black}/{0–90}` to give the surface its translucent base. Dark-mode refinements (dimmer highlight, deeper shadow) are wired via explicit `.dark .glass …` selectors, which outrank Tailwind's `:where(.dark, .dark *)` `dark:bg-*` utilities.

**Cascade caveat:** because custom `@layer utilities` are appended *after* Tailwind's built-ins within the same layer, `.glass*`'s `border: 1px solid …` shorthand expansion wins over user-applied `border-t-0` / `border-l-0` on the same element at source order. Don't try to suppress individual edges of `.glass*` from a consumer — either accept the full 1px ring or use a wrapper element.

Performance note: `backdrop-filter: blur()` is GPU-expensive when stacked. Apply to top-level surfaces only; small UI affordances (toggles, segmented controls, buttons) deliberately stay solid to keep scroll perf on mobile acceptable.

Page backdrop is the cool-steel multi-stop gradient `from-sky-200 via-cyan-100 to-teal-200` / `dark:from-sky-950 via-cyan-950 to-teal-950` (see §5.5). The Liquid Glass saturate(180%) and blur(20–32px) reads strongly against the cool palette and the cyan→teal midtones complement the glass edges. If you ever want a more muted feel, drop the `via-` midtone or tighten the saturation, but the gradient is what makes the glass readily visible.

## 6. External APIs (OpenWeatherMap)

All three endpoints are called directly from the browser; CORS is enabled on the OpenWeatherMap public API.

| Endpoint                                  | Used in                            | Purpose                                                |
| ----------------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `/data/2.5/forecast?q=<city>&cnt=56`      | `src/app/page.tsx`                 | 5-day / 3-hour forecast — shows hourly strip + 5-day list |
| `/data/2.5/find?q=<prefix>`               | `Navbar.tsx` (`handleInputChange`) | City-name autocomplete                                 |
| `/data/2.5/weather?lat&lon`               | `Navbar.tsx` (“use my location”)   | Reverse-geocode coordinates → `res.data.name`         |

Weather icons are loaded directly from `https://openweathermap.org/img/wn/<icon>.png` (no Next/Image wrapper).

## 7. Quirks & Non-obvious notes

1. **Typo alerts** — do not rename without considering downstream references:
   - `src/components/ForcarWeatherDetails.tsx` — export `ForcastWeatherDatails` (sic). Search code before changing.
   - `src/components/WeatherDetails.tsx` — export `WeatherDatails` (sic).
2. **`src/app/layout.tsx` is `"use client"`** — unusual for a Next.js layout file. Done so the `QueryClient` instance can be constructed per render and JSX-wrapped with `<QueryClientProvider>`. If you convert it back to a server component, move the provider into a separate client wrapper (e.g. `Providers.tsx`).
3. **Inline scripts in `<head>`** — `themeScript` and `localeScript` are `dangerouslySetInnerHTML`'d. They run before hydration and use `try/catch` to be safe in restricted environments. Required to avoid dark-mode flash and wrong `lang` attribute flash.
4. **`QueryClient` is created inside the component** — one per root render, no shared cache across navigations. Fine for a single-page app; would need lifting to a module-level singleton if multi-page.
5. **Wind speed quirk** — `src/utils/meterToKilometer.ts → covertInMetersPerSecond` claims to convert m/s to km/h but uses the factor `3.5` (not the exact `3.6`). Treat as intentional "rounded" behavior, not a bug fix, unless explicitly told.
6. **Forecast endpoint uses `cnt=56` to fetch 5 days × 8 three-hour slots.** Page derives "one entry per day" client-side by grouping `dt` ISO dates.
7. **Default city on first load is `"London"`** — set by `placeAtom` initial value. No geolocation prompt fires automatically; user must click the location pin.
8. **`tsconfig.json` path alias `@/*` maps to `./*`**, so some files use `@/src/components/...` while others use `../components/...`. The codebase is **inconsistent** — match the file you're editing.
9. **No tests, no Storybook, no CI config.** Adding any of these is open-ended work — confirm before scaffolding.
10. **Tailwind v4** is configured via PostCSS plugin only (no `tailwind.config.js`). `src/app/globals.css` currently declares only the dark variant (`@variant dark (&:where(.dark, .dark *));`) — no `@theme` directive yet. If you need custom theme tokens (colors, spacing, etc.), that's the extension point.
11. **`Navbar.tsx` subscribes to `placeAtom` twice in one render:** `const [place] = useAtom(placeAtom); const [, setPlace] = useAtom(placeAtom);`. Both subscriptions see the same value but each is its own subscription — fine functionally, but if you refactor, collapse to `const [place, setPlace] = useAtom(placeAtom);`.
12. **`ForcastWeatherDatails` relies on defaults set at the call site, not on the component.** `page.tsx` does `description={d?.weather[0].description ?? ""}`, `weatherIcon={d?.weather[0].icon ?? "01d"}`, etc. The component itself does not guard against undefined, so any future caller that forgets the `??` will render `NaN` / empty strings silently.

## 8. Adding things — recipes

### Add a new UI string

1. Add the key to **both** `en` and `de` in `src/i18n/translations.ts`.
2. Use it via `useTranslation().t("yourKey")`.

### Add a new preference toggle

Model after `ThemeToggle.tsx` (see §5.1 for the hydrate/persist pattern) and add to both the desktop actions row and the mobile drawer in `Navbar.tsx`.

### Add a new city search/autocomplete field

Use the same `axios.get("/data/2.5/find?q=...")` pattern from `Navbar.tsx`. Suggest min-length 3 to avoid spamming the API.

## 9. Common pitfalls to avoid

- Don't fetch in `page.tsx` with axios for the main forecast — the existing `useQuery` uses native fetch; mixing causes inconsistent error paths.
- `Metadata` is currently *commented out* and uses `type`-only import. If you ever uncomment the `metadata` export while `layout.tsx` stays `"use client"`, Next will error — `metadata` requires a server component. Either convert `layout.tsx` to a server component (move the QueryClient provider to a sibling client wrapper) or drop the metadata.
- Don't read `localStorage` outside a `useEffect` — the components are universal and SSR will crash.
- Don't import `date-fns/locale/{de}` without importing `enUS` too — the current conditional pattern relies on both being available.
- Don't rename the typo exports (`ForcastWeatherDatails`, `WeatherDatails`) without a grep across `page.tsx`, `ForcarWeatherDetails.tsx`, and `WeatherDetails.tsx`.

## 10. File map for fastest navigation

| Need to touch…                              | Open…                                          |
| ------------------------------------------- | ---------------------------------------------- |
| State shape / defaults                      | `src/app/atom.ts`                              |
| Page rendering, query, forecast derivation  | `src/app/page.tsx`                             |
| Provider setup, font loader, theme/locale scripts | `src/app/layout.tsx`                     |
| Search / location / mobile menu             | `src/components/Navbar.tsx`                    |
| Translations                               | `src/i18n/translations.ts`                      |
| Translation hook                            | `src/hooks/useTranslation.ts`                  |
| °C/°F conversion                            | `src/utils/convertKelvinToCelsius.tsx`         |
| Day-temp display                            | `src/components/ForcarWeatherDetails.tsx`      |
| Metric grid (vis/humidity/wind/...)         | `src/components/WeatherDetails.tsx`            |
| Tailwind / dark mode CSS                    | `src/app/globals.css`                          |
