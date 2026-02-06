import type { PokemonForm } from '@app-types/pokemon';

export interface PokemonListProps {
	readonly pokemons: readonly PokemonForm[];
	readonly isLoading: boolean;
	readonly error: string | null;
	readonly isRetryable: boolean;
	readonly hasQuery: boolean;
	readonly onRetry: () => void;
}
