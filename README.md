# Pokémon Search App

Wyszukiwarka Pokémonów oparta o PokeAPI. Zadanie rekrutacyjne.

To mój pierwszy projekt w React - na co dzień pracuję z Angularem. Pewne rzeczy mogą wyglądać "po angularowemu" (struktura folderów, wydzielone serwisy, RxJS) bo to jedyne co znam. Starałem się doczytywać jak rzeczy robi się w React, ale na pewno nie wszystko udało mi się ogarnąć.

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
- RxJS
- Zod
- Vitest
- ESLint (typescript-eslint + react-hooks)

## Czemu takie technologie?

**Vite** - Na rozmowie wspominałem że znam Webpacka. Doczytałem, że w Angularze od wersji 17+ Vite zastąpił Webpacka pod spodem, a w React jest teraz standardem do nowych projektów. Szybki dev server, HMR od razu, zero konfiguracji - spory upgrade względem Webpacka.

**Vitest** - Angular 21 niedawno przesiadł się na Vitest i nie miałem jeszcze okazji go przetestować. Zadanie rekrutacyjne to dobry moment żeby się z nim zapoznać. API prawie identyczne jak w Jest, a dziedziczy konfigurację z Vite, więc zero dodatkowego setupu.

**TailwindCSS** - Aktualnie testuje sobie ten framework w wolnej chwili, to postanowiłem, że skorzystam :). W Angularze korzystałem głównie z Angular Material, Tailwind to dla mnie zupełnie inne podejście do stylowania.

**RxJS** - Wiem, że w tym wypadku to overkill i normalnie wystarczy `useState` + `useEffect` albo coś w stylu React Query. Ale RxJS używałem sporo w Angularze i sięgnąłem po niego instynktownie - wiedziałem jak ogarnąć cancel requestów, debouncing, retry i error handling w jednym strumieniu. Jak będę lepiej znał React, pewnie podszedłbym do tego inaczej.

**Zod** - Doczytałem, że w ekosystemie React Zod jest dość standardowym wyborem do walidacji. TypeScript sprawdza typy tylko w compile-time, a w runtimie nikt nie zagwarantuje, że PokeAPI zwróci to co oczekuję. Zod waliduje dane na wejściu i generuje typy przez `z.infer`, więc nie muszę nic duplikować. Jak API zmieni format odpowiedzi, od razu to wychwyci.

## Struktura

```
src/
├── components/     # komponenty React (w tym ErrorBoundary)
├── hooks/          # custom hooki
├── services/       # komunikacja z API, cache
├── utils/          # helpery
├── types/          # typy TS + display utilities
├── interfaces/     # interfejsy propsów
└── errors/         # hierarchia klas błędów (z polimorficznym isRetryable)
```

Struktura przeniesiona z tego jak organizuję kod w Angularze - wydzielone serwisy, osobne typy, hierarchia błędów. Doczytałem, że w React częściej grupuje się po feature'ach, ale na razie taki podział jest jedynym jaki znam i przy tej skali aplikacji nie powinno to przeszkadzać. Przy tak małej aplikacji też ciężko podzielić na "feature'y", bo wszystko jest ze sobą ściśle powiązane.

## Co robi aplikacja

- Wyszukiwanie Pokémonów po nazwie
- Debouncing żeby nie spamować API
- Retry przy błędach sieciowych (polimorficzny `isRetryable()` na hierarchii błędów)
- Cache wyników (żeby nie odpytywać dwa razy o to samo)
- Timeout na requesty (10s)
- Anulowanie poprzednich requestów przy nowym wyszukiwaniu
- Obsługa błędów z konkretnymi komunikatami
- Error Boundary - łapie błędy renderowania i wyświetla fallback UI
- Memoizacja komponentów (`React.memo`, `useMemo`, `useCallback`)

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

**Co jest pokryte:**

- `utils/filters.ts` - filtrowanie po prefiksie (100%)
- `errors/PokemonApiError.ts` - klasyfikacja błędów HTTP (100%)
- `services/pokemonCache.ts` - cache (100%)
- `services/pokemonService.ts` - główna logika szukania (~96%)
- `utils/httpUtils.ts` - fetch z retry, timeout i walidacją (~96%)
- `utils/abortUtils.ts` - delay z abort (~96%)

**Czemu brak testów na komponenty i hooki?**

Nie znam jeszcze React Testing Library na tyle, żeby pisać w nim sensowne testy w rozsądnym czasie. Komponenty lepiej testować integracyjnie albo E2E (osobiście korzystam z Playwright), a na naukę RTL w ramach tego zadania nie starczyło czasu. To też tylko w ramach proof of concept.
