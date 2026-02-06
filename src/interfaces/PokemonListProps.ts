import type { PokemonForm } from '../types/pokemon';

export interface PokemonListProps {
	readonly pokemons: readonly PokemonForm[];
	readonly isLoading: boolean;
	readonly error: string | null;
	readonly hasQuery: boolean;
	readonly onRetry: () => void;
}
