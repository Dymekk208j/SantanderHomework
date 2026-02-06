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
				'mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-6 pb-8 pt-16 max-sm:px-4 max-sm:pb-6 max-sm:pt-8'
			}
		>
			<header className="mb-10 text-center">
				<div className="mb-1 inline-flex items-center justify-center gap-3">
					<Pokeball />
					<h1 className="bg-gradient-to-br from-poke-red to-pink-300 bg-clip-text font-display text-5xl font-black leading-none tracking-tight text-transparent max-sm:text-4xl">
						PokéApp
					</h1>
				</div>
				<p className="mt-2 text-sm font-medium uppercase tracking-[2px] text-poke-muted">Gotta search 'em all</p>
				<p className="mt-3 text-xs text-poke-muted/60">Homework for Santander interview</p>
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

			<footer className="mt-10 border-t border-white/[0.06] pt-6 text-center text-[0.7rem] text-poke-muted">
				Powered by PokéAPI · Built with React & TypeScript
			</footer>
		</div>
	);
};

export default App;
