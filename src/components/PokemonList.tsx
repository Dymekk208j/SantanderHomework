import * as React from 'react';
import { toPokemonDisplay } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';
import { LoadingDots } from './LoadingDots';
import type { PokemonListProps } from '../interfaces/PokemonListProps';
import type { MessageBoxProps } from '../interfaces/MessageBoxProps';

const MessageBox: React.FC<MessageBoxProps> = ({ icon, text, variant, extra }) => {
	const variantStyles = {
		loading: 'bg-poke-surface border-white/[0.06] text-poke-secondary',
		error: 'bg-red-500/5 border-red-400/20 text-red-400',
		empty: 'bg-poke-surface border-white/[0.06] text-poke-muted',
	} as const;

	return (
		<div
			className={`rounded-[14px] border px-5 py-6 text-center ${variantStyles[variant]}`}
			role={variant === 'error' ? 'alert' : undefined}
			aria-live={variant !== 'error' ? 'polite' : undefined}
		>
			{extra}
			{icon && <span className="mb-2 block text-2xl">{icon}</span>}
			<span className="text-sm font-medium">{text}</span>
		</div>
	);
};

export const PokemonList: React.FC<PokemonListProps> = ({ pokemons, isLoading, error, hasQuery, onRetry }) => {
	if (error) {
		return (
			<div className="rounded-[14px] border border-red-400/20 bg-red-500/5 px-5 py-6 text-center" role="alert">
				<span className="mb-2 block text-2xl">⚠️</span>
				<span className="mb-3 block text-sm font-medium text-red-400">{error}</span>
				<button
					type="button"
					onClick={onRetry}
					className="rounded-lg border border-poke-red/30 bg-poke-red/20 px-4 py-2 text-sm font-semibold text-poke-red transition-all duration-150 hover:bg-poke-red/30 active:scale-95"
				>
					Try again
				</button>
			</div>
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
				{pokemons.map((pokemon, index) => (
					<PokemonCard key={pokemon.id} pokemon={toPokemonDisplay(pokemon)} index={index} />
				))}
			</ul>
		</div>
	);
};
