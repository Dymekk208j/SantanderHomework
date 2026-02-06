import { HTTPError } from 'ky';
import type { PokemonForm } from '@app-types/pokemon';
import { PokemonFormSchema } from '@app-types/pokemon';
import { PokemonAbortError, PokemonValidationError, PokemonApiError, PokemonNetworkError, PokemonError } from '@errors';
import { MAX_RESULTS } from '@constants';
import { api } from './api';
import { PokemonCache } from '@services/pokemonCache';
import { filterByPrefix } from '@utils/filters';

export async function searchPokemonsByName(query: string, signal?: AbortSignal): Promise<PokemonForm[]> {
	// Fetch the cached list - if signal is provided, race against abort
	const allPokemonsPromise = PokemonCache.fetchAll();

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
		matched.map(async (pokemon) => {
			try {
				signal?.throwIfAborted();
				const json: unknown = await api.get(pokemon.url, { signal }).json();

				try {
					return PokemonFormSchema.parse(json);
				} catch (zodError) {
					throw new PokemonValidationError('Failed to validate Pokemon form', zodError);
				}
			} catch (error: unknown) {
				if (error instanceof PokemonError) {
					throw error;
				}

				if (error instanceof DOMException && error.name === 'AbortError') {
					throw new PokemonAbortError();
				}

				if (error instanceof HTTPError) {
					throw new PokemonApiError(
						`API error: ${error.response.status} ${error.response.statusText}`,
						error.response.status
					);
				}

				throw new PokemonNetworkError();
			}
		})
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
