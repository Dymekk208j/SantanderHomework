import { useMemo } from 'react';
import type { FC } from 'react';
import { toPokemonDisplay } from '@utils/pokemonFormatters';
import { PokemonCard } from '@components/PokemonCard';
import { LoadingDots } from '@components/LoadingDots';
import { MessageBox } from '@components/MessageBox';
import type { PokemonListProps } from '@app-types';

export const PokemonList: FC<PokemonListProps> = ({ pokemons, isLoading, error, isRetryable, hasQuery, onRetry }) => {
	const displayPokemons = useMemo(() => pokemons.map(toPokemonDisplay), [pokemons]);

	if (error) {
		return (
			<MessageBox
				icon="⚠️"
				text={error}
				variant="error"
				action={
					isRetryable ? (
						<button
							type="button"
							onClick={onRetry}
							className="rounded-lg border border-poke-red/30 bg-poke-red/20 px-4 py-2 text-sm font-semibold text-poke-red transition-all duration-150 hover:bg-poke-red/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-red focus-visible:ring-offset-2 focus-visible:ring-offset-poke-bg active:scale-95"
						>
							Try again
						</button>
					) : undefined
				}
			/>
		);
	}

	if (isLoading) {
		return <MessageBox icon="" text="Searching the Pokédex…" variant="loading" extra={<LoadingDots />} />;
	}

	if (hasQuery && pokemons.length === 0) {
		return <MessageBox icon="🤷" text="No Pokémon found. Try a different name!" variant="empty" />;
	}

	if (pokemons.length === 0) {
		return null;
	}

	return (
		<div>
			<p className="mb-2 pl-0.5 text-[0.7rem] font-semibold uppercase tracking-[1px] text-poke-muted">
				{pokemons.length} {pokemons.length === 1 ? 'result' : 'results'}
			</p>
			<ul className="flex flex-col gap-3" role="list" aria-label="Search results">
				{displayPokemons.map((pokemon, index) => (
					<PokemonCard key={pokemon.displayId} pokemon={pokemon} index={index} />
				))}
			</ul>
		</div>
	);
};
