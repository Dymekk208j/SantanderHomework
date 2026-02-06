# Pokémon Search App

Aplikacja do wyszukiwania Pokémonów wykorzystująca PokeAPI. Projekt stworzony jako zadanie rekrutacyjne.

## 🚀 Instalacja i uruchomienie

### Wymagania

- Node.js (wersja 18 lub wyższa)
- npm lub yarn

### Instalacja zależności

```bash
npm install
```

### Uruchomienie w trybie deweloperskim

```bash
npm run dev
```

Aplikacja będzie dostępna domyślnie pod adresem `http://localhost:5173`

### Build produkcyjny

```bash
npm run build
```

### Podgląd buildu produkcyjnego

```bash
npm run preview
```

## 🛠️ Technologie

- **React 18** + **TypeScript** - framework i język
- **Vite** - bundler i dev server
- **TailwindCSS** - stylowanie
- **RxJS** - reaktywne zarządzanie stanem i asynchronicznością
- **Zod** - walidacja danych z API

## 💡 Decyzje projektowe

### TailwindCSS

Zdecydowałem się na TailwindCSS, ponieważ aktualnie się go uczę i chciałem wykorzystać tę okazję do praktycznego zastosowania tej technologii.

### RxJS

Świadomie użyłem RxJS mimo że jest overkillem w tym przypadku. Wynika to z mojej znajomości tej biblioteki i chęci zaprezentowania umiejętności pracy z reaktywnymi streamami danych. W tak małej aplikacji prostsze rozwiązanie (np. useState + useEffect) byłoby wystarczające, ale RxJS pozwala na eleganckie zarządzanie:

- Anulowaniem requestów przy nowym wyszukiwaniu
- Debouncingiem
- Retry logic
- Obsługą błędów w jednym miejscu

### Modularność

Starałem się zachować wysoką modularność pomimo że jest to mała aplikacja. Wynika to z moich preferencji dotyczących struktury kodu - wolę mieć dobrze zorganizowane, łatwe do testowania i rozszerzania komponenty, nawet jeśli projekt jest niewielki. Struktura została podzielona na:

- `components/` - komponenty React
- `hooks/` - custom hooki
- `services/` - logika biznesowa i komunikacja z API
- `utils/` - funkcje pomocnicze
- `types/` - definicje typów
- `interfaces/` - interfejsy komponentów
- `errors/` - hierarchia błędów

## 📁 Struktura projektu

```
src/
├── components/      # Komponenty React
├── hooks/          # Custom hooki
├── services/       # Serwisy (API, cache)
├── utils/          # Funkcje pomocnicze
├── types/          # Typy TypeScript
├── interfaces/     # Interfejsy props
└── errors/         # Klasy błędów
```

## ✨ Funkcjonalności

- 🔍 Wyszukiwanie Pokémonów po nazwie
- ⚡ Debouncing zapytań
- 🔄 Automatyczne retry przy błędach
- 💾 Cache wyników
- ⏱️ Timeout requestów
- 🎨 Responsywny design
- 🚫 Obsługa anulowania requestów
- ⚠️ Szczegółowa obsługa błędów

## 📝 Dodatkowe komendy

```bash
# Formatowanie kodu
npm run format

# Sprawdzenie formatowania
npm run format:check

# Linting
npm run lint
```
