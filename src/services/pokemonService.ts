import type { PokemonForm } from '@app-types/pokemon';
import { PokemonFormSchema } from '@app-types/pokemon';
import { PokemonAbortError } from '@errors';
import { MAX_RESULTS } from '@constants';
import { fetchAndValidate } from '@utils/httpUtils';
import { fetchAllPokemonForms, clearPokemonCache } from '@services/pokemonCache';
import { filterByPrefix } from '@utils/filters';

// Re-export for convenience
export { clearPokemonCache, PokemonAbortError };

export async function searchPokemonsByName(query: string, signal?: AbortSignal): Promise<PokemonForm[]> {
	// Fetch the cached list - if signal is provided, race against abort
	const allPokemonsPromise = fetchAllPokemonForms();

	const allPokemons = signal
		? await Promise.race([
				allPokemonsPromise,
				new Promise<never>((_, reject) => {
					if (signal.aborted) {
						reject(new PokemonAbortError('Request aborted before fetch'));
						return;
					}
					const abortHandler = () => reject(new PokemonAbortError('Request aborted'));
					signal.addEventListener('abort', abortHandler, { once: true });
					// Clean up if allPokemonsPromise resolves first
					void allPokemonsPromise.finally(() => {
						signal.removeEventListener('abort', abortHandler);
					});
				}),
			])
		: await allPokemonsPromise;

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
