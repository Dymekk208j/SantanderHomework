import type { PokemonListItem } from '@app-types/pokemon';
import { PokemonListResponseSchema } from '@app-types/pokemon';
import { PokemonError } from '@errors';
import { POKEMON_FORM_ENDPOINT, TOTAL_POKEMON_LIMIT } from '@constants';
import { fetchAndValidate } from '@utils/httpUtils';

let cachedListPromise: Promise<readonly PokemonListItem[]> | null = null;

export function clearPokemonCache(): void {
	cachedListPromise = null;
}

/**
 * Fetches all Pokemon forms. The result is cached - subsequent calls return the same promise.
 * Note: This function does NOT accept an AbortSignal to avoid sharing abort state between callers.
 * If you need abort support, wrap the call with your own abort logic (e.g., Promise.race).
 */
export function fetchAllPokemonForms(): Promise<readonly PokemonListItem[]> {
	if (!cachedListPromise) {
		cachedListPromise = fetchAndValidate(
			`${POKEMON_FORM_ENDPOINT}?limit=${TOTAL_POKEMON_LIMIT}`,
			PokemonListResponseSchema
		)
			.then((data) => Object.freeze(data.results))
			.catch((error: PokemonError) => {
				cachedListPromise = null;
				throw error;
			});
	}

	return cachedListPromise;
}
