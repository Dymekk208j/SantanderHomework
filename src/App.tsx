import * as React from 'react';
import { Pokeball } from './components/Pokeball';
import { SearchInput } from './components/SearchInput';
import { PokemonList } from './components/PokemonList';
import { usePokemonSearch } from './hooks/usePokemonSearch';

const App: React.FC = () => {
  const { query, setQuery, results, isLoading, error, retry } = usePokemonSearch();

  return (
    <div
      className={
        "
        w-full max-w-[520px] mx-auto min-h-screen flex flex-col
        px-6 pt-16 pb-8
        max-sm:px-4 max-sm:pt-8 max-sm:pb-6
      "
      }
    >
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-3 mb-1">
          <Pokeball />
          <h1
            className={
              "
              font-display text-5xl font-black tracking-tight leading-none
              bg-gradient-to-br from-poke-red to-pink-300
              bg-clip-text text-transparent
              max-sm:text-4xl
            "
            }
          >
            PokéApp
          </h1>
        </div>
        <p className="text-sm text-poke-muted font-medium uppercase tracking-[2px] mt-2">
          Gotta search 'em all
        </p>
      </header>

      <main className="flex-1">
        <SearchInput value={query} onChange={setQuery} />
        <PokemonList
          pokemons={results}
          isLoading={isLoading}
          error={error}
          hasQuery={query.trim().length > 0}
          onRetry={retry}
        />
      </main>

      <footer className="text-center mt-10 pt-6 border-t border-white/[0.06] text-[0.7rem] text-poke-muted">
        Powered by PokéAPI · Built with React & TypeScript
      </footer>
    </div>
  );
};

export default App;
