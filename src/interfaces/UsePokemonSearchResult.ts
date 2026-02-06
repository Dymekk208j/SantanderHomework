import type { PokemonForm } from '@app-types/pokemon';

export interface UsePokemonSearchResult {
	readonly query: string;
	readonly setQuery: (value: string) => void;
	readonly results: readonly PokemonForm[];
	readonly isLoading: boolean;
	readonly error: string | null;
	readonly retry: () => void;
}
