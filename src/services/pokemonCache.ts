import type { PokemonListItem } from '../types/pokemon';
import { PokemonListResponseSchema } from '../types/pokemon';
import { PokemonError } from '../errors';
import { POKEMON_FORM_ENDPOINT, TOTAL_POKEMON_LIMIT } from '../constants';
import { fetchAndValidate } from '../utils/httpUtils';

let cachedListPromise: Promise<readonly PokemonListItem[]> | null = null;

export function clearPokemonCache(): void {
	cachedListPromise = null;
}

export function fetchAllPokemonForms(signal?: AbortSignal): Promise<readonly PokemonListItem[]> {
	if (!cachedListPromise) {
		cachedListPromise = fetchAndValidate(
			`${POKEMON_FORM_ENDPOINT}?limit=${TOTAL_POKEMON_LIMIT}`,
			PokemonListResponseSchema,
			signal
		)
			.then((data) => Object.freeze(data.results))
			.catch((error: PokemonError) => {
				cachedListPromise = null;
				throw error;
			});
	}

	return cachedListPromise;
}
