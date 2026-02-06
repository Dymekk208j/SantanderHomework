# Pokémon Search App

Wyszukiwarka Pokémonów oparta o PokeAPI. Zadanie rekrutacyjne.

Na co dzień pracuję z Angularem, to mój pierwszy projekt w React. Pewne rzeczy mogą wyglądać "po angularowemu" (wydzielone serwisy, hierarchia błędów, 1 plik = 1 odpowiedzialność) - starałem się doczytywać jak to się robi w React, ale pewnie nie wszystko złapałem.

## Jak odpalić

Node.js 18+ i npm.

```bash
npm install
npm run dev        # dev server na http://localhost:5173
npm run build      # build produkcyjny
npm run preview    # podgląd builda
```

## Stack

- React 18 + TypeScript
- Vite
- TailwindCSS
- TanStack Query (React Query)
- Zod
- ky (HTTP client)
- Vitest
- ESLint + Prettier

## Czemu takie technologie?

**Vite** - Na rozmowie wspominałem że znam Webpacka. W Angularze od 17+ Vite zastąpił Webpacka pod spodem, w React jest teraz standardem. Szybki dev server, HMR, zero konfiguracji.

**Vitest** - Angular 21 niedawno przesiadł się na Vitest, nie miałem okazji go jeszcze przetestować. API prawie identyczne jak Jest, dziedziczy config z Vite - zero dodatkowego setupu.

**TailwindCSS** - Testuję sobie w wolnej chwili, to skorzystałem :). W Angularze używałem głównie Angular Material, Tailwind to zupełnie inne podejście.

**TanStack Query** - Początkowo wziąłem RxJS (strefa komfortu z Angulara), ale potem przerobiłem na TanStack Query. Daje cache, deduplikację requestów, retry, loading/error states - bez pisania tego samemu. Z ~116 linii hooka z RxJS pipeline zrobiło się ~40 z `useQuery`. Oprócz tego dodałem prosty cache na poziomie modułu w pokemonService na listę Pokémonów, żeby nie ciągnąć jej za każdym razem.

**Zod** - TypeScript sprawdza typy w compile-time, ale w runtimie nikt nie zagwarantuje co zwróci API. Zod waliduje dane i generuje typy przez `z.infer` - jedno źródło prawdy.

**ky** - Lekki wrapper na fetch z retry, timeoutem i lepszymi błędami. Jedna konfiguracja w `api.ts` dla całej apki, łatwiej mockować w testach niż gołego fetch.

**Prettier** - Autoformatowanie z pluginem do sortowania klas Tailwinda.

## Struktura

```
src/
├── components/
│   ├── common/       # Pokeball, MessageBox, ErrorBoundary, LoadingDots
│   ├── pokemon/      # PokemonCard, PokemonList
│   └── search/       # SearchInput
├── hooks/            # usePokemonSearch, useDebounce
├── services/         # pokemonService, api
├── utils/            # formattery, filtry
├── types/            # branded types, Zod schemas, props
└── errors/           # hierarchia klas błędów
```

Trzymam się zasady 1 plik = 1 odpowiedzialność (moja wizja SRP na FE). `MessageBox` ma własny plik mimo że używany tylko w jednym miejscu, każdy hook osobno, każdy error osobno. Pewnie over-engineering na tę skalę, ale łatwiej mi się w tym poruszać.

## Co robi aplikacja

- Szukanie po nazwie (prefix match, limit wyników)
- Debounce 300ms na input
- Retry z exponential backoff, hierarchia błędów decyduje które retrywać
- Przycisk "Try again" przy błędach
- Cache na dwóch poziomach - TanStack Query (stale 5min) + module-level cache na listę Pokémonów
- Timeout 10s na requesty
- Różne komunikaty zależnie od typu błędu (sieć, API, walidacja, timeout)
- Error Boundary
- Path aliases (`@services`, `@utils`, itp.)
- `React.memo` / `useMemo` / `useCallback` gdzie miało sens

## Komendy

```bash
npm test                # testy
npm run test:watch      # watch mode
npm run test:ui         # Vitest UI
npm run test:coverage   # coverage
npm run format          # formatowanie
npm run format:check    # sprawdzenie formatowania
npm run lint            # linting
```

## Testy

Vitest. Testowałem logikę biznesową, nie komponenty - to umiem testować niezależnie od frameworka.

Pokrycie:

- `utils/filters.ts` - filtrowanie po prefiksie (100%)
- `errors/PokemonApiError.ts` - klasyfikacja błędów HTTP, `isRetryable()` (100%)
- `services/pokemonService.ts` - logika wyszukiwania (~96%)

Pliki testowe w folderach `__tests__/` obok kodu który testują.

Na komponenty i hooki nie pisałem testów - nie znam React Testing Library na tyle żeby pisać w nim sensowne testy w rozsądnym czasie. Na RTL w ramach tego zadania nie starczyło czasu, a komponenty i tak lepiej testować E2E (używam Playwright).
