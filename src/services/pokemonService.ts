import type { PokemonForm } from '../types/pokemon';
import { PokemonFormSchema } from '../types/pokemon';
import { PokemonAbortError } from '../errors';
import { MAX_RESULTS } from '../constants';
import { fetchAndValidate } from '../utils/httpUtils';
import { fetchAllPokemonForms, clearPokemonCache } from './pokemonCache';
import { filterByPrefix } from '../utils/filters';

// Re-export for convenience
export { clearPokemonCache, PokemonAbortError };

export async function searchPokemonsByName(query: string, signal?: AbortSignal): Promise<PokemonForm[]> {
	const allPokemons = await fetchAllPokemonForms(signal);
	const matched = filterByPrefix(allPokemons, query, MAX_RESULTS);

	if (matched.length === 0) return [];

	const settled = await Promise.allSettled(
		matched.map((pokemon) => fetchAndValidate(pokemon.url, PokemonFormSchema, signal))
	);

	const results: PokemonForm[] = [];

	for (const result of settled) {
		if (result.status === 'fulfilled') {
			results.push(result.value);
		} else if (result.reason instanceof PokemonAbortError) {
			throw result.reason;
		}
		// Silently ignore other errors in batch requests
	}

	return results;
}
