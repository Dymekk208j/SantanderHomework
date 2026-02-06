# Pokémon Search App

Wyszukiwarka Pokémonów oparta o PokeAPI. Zadanie rekrutacyjne.

To mój pierwszy projekt w React - na co dzień pracuję z Angularem. Pewne rzeczy mogą wyglądać "po angularowemu" (struktura folderów, wydzielone serwisy) bo to jedyne co znam. Starałem się doczytywać jak rzeczy robi się w React, ale na pewno nie wszystko udało mi się ogarnąć.

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
- ESLint (typescript-eslint + react-hooks)

## Czemu takie technologie?

**Vite** - Na rozmowie wspominałem że znam Webpacka. Doczytałem, że w Angularze od wersji 17+ Vite zastąpił Webpacka pod spodem, a w React jest teraz standardem do nowych projektów. Szybki dev server, HMR od razu, zero konfiguracji - spory upgrade względem Webpacka.

**Vitest** - Angular 21 niedawno przesiadł się na Vitest i nie miałem jeszcze okazji go przetestować. Zadanie rekrutacyjne to dobry moment żeby się z nim zapoznać. API prawie identyczne jak w Jest, a dziedziczy konfigurację z Vite, więc zero dodatkowego setupu.

**TailwindCSS** - Aktualnie testuje sobie ten framework w wolnej chwili, to postanowiłem, że skorzystam :). W Angularze korzystałem głównie z Angular Material, Tailwind to dla mnie zupełnie inne podejście do stylowania.

**TanStack Query** - Professionally maintained library do zarządzania asynchronicznym stanem. Początkowo sięgnąłem po RxJS (moja strefa komfortu z Angulara), ale po code review zdecydowałem się na refactor. TanStack Query oferuje out-of-the-box: automatyczny cache z inteligentnym invalidation (5min stale time), deduplikację requestów, background refetching, loading/error states i devtools. Zamiast 116 linii własnego hooka z RxJS pipeline teraz mam 40 linii z `useQuery` - mniej kodu do utrzymania, lepsze UX, zero zewnętrznych zależności do obsługi streamów. W ekosystemie React to industry standard, więc łatwiej będzie onboardować innych devs.

**Zod** - W ekosystemie React to dość standardowy wybór. TypeScript sprawdza typy tylko w compile-time, a w runtimie nikt nie zagwarantuje, że PokeAPI zwróci to co oczekuję. Zod waliduje dane na wejściu i generuje typy przez `z.infer`, więc nie muszę nic duplikować. Jak API zmieni format odpowiedzi, od razu to wychwyci.

**ky** - Lekki HTTP client (5KB) z wbudowanym retry, timeoutem i lepszą obsługą błędów niż fetch. Battle-tested biblioteka oferująca exponential backoff, filtrowanie status codes, abort signal support i automatyczny timeout. Jedna konfiguracja w `api.ts` definiuje zachowanie dla całej aplikacji - mniej kodu do utrzymania, łatwiejsze testy (mockowanie na poziomie ky zamiast fetch), i mniejsze ryzyko edge cases niż przy własnej implementacji.

## Struktura

```
src/
├── components/     # każdy komponent w osobnym pliku (MessageBox, PokemonCard, itd.)
├── hooks/          # custom hooki (usePokemonSearch, useDebounce)
├── services/       # serwisy API (pokemonService.ts, api.ts)
├── utils/          # luźne funkcje helper (formattery, filtry)
├── types/          # typy TS i interfejsy (branded types, Zod schemas, component props)
└── errors/         # hierarchia klas błędów
```

Struktura przeniesiona z tego jak organizuję kod w Angularze - wydzielone serwisy, osobne typy, hierarchia błędów. Doczytałem, że w React częściej grupuje się po feature'ach, ale na razie taki podział jest jedynym jaki znam i przy tej skali aplikacji nie powinno to przeszkadzać. Przy tak małej aplikacji też ciężko podzielić na "feature'y", bo wszystko jest ze sobą ściśle powiązane.

**Zasada Single Responsibility (SRP)**

Świadoma decyzja żeby trzymać się 1 plik = 1 odpowiedzialność, podobnie jak w .NET gdzie 1 klasa = 1 plik. W TypeScript/React spotyka się często praktykę trzymania helper componentów w tym samym pliku co parent albo grupowanie funkcji utils w jednym pliku - celowo tego unikam. Przykłady:

- `MessageBox` ma własny plik mimo że używany tylko w `PokemonList` - łatwiej później wyciągnąć do reużycia
- Każdy custom hook w osobnym pliku (`usePokemonSearch`, `useDebounce`) - separacja logiki biznesowej od UI
- Każda klasa błędu w osobnym pliku w hierarchii - łatwiej śledzić dziedziczenie i odpowiedzialności

To może wyglądać "over-engineered" dla tak małego projektu, ale trzymam się tego co znam z backendu. Przy skalowaniu kodu ta struktura ułatwia refaktoring i testowanie.

## Co robi aplikacja

- Wyszukiwanie po nazwie (filtrowanie po prefiksie, limit wyników)
- Debouncing 300ms żeby nie spamować API (custom `useDebounce` hook)
- Retry przy błędach sieciowych - linear backoff, a hierarchia błędów z `isRetryable()` decyduje czy retry ma sens
- Przycisk "Try again" - refetch z TanStack Query z zachowaniem poprzedniego zapytania
- Automatyczny cache z TanStack Query - 5min stale time, 10min garbage collection, deduplikacja requestów out of the box
- Timeout 10s na requesty (konfiguracja ky)
- Konkretne komunikaty błędów (sieć, API, walidacja, timeout)
- Error Boundary łapiący błędy renderowania
- `React.memo`, `useMemo`, `useCallback` gdzie miało to sens

## Komendy

```bash
npm test                # testy
npm run test:watch      # testy w trybie watch
npm run test:ui         # Vitest UI
npm run test:coverage   # coverage report
npm run format          # formatowanie
npm run format:check    # sprawdzenie formatowania
npm run lint            # linting
```

## Testy

Testy napisane w Vitest. Skupiłem się na logice biznesowej, nie na komponentach - to jest część, którą umiem testować niezależnie od frameworka.

Co jest pokryte:

- `utils/filters.ts` - filtrowanie po prefiksie (100%)
- `errors/PokemonApiError.ts` - klasyfikacja błędów HTTP (100%)
- `services/pokemonService.ts` - główna logika szukania (~96%)

Brak testów na komponenty i hooki - nie znam jeszcze React Testing Library na tyle żeby pisać w nim sensowne testy w rozsądnym czasie. Komponenty lepiej testować integracyjnie albo E2E (osobiście korzystam z Playwright), a na naukę RTL w ramach tego zadania nie starczyło czasu.
