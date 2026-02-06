import { HTTPError } from 'ky';
import type { PokemonForm, PokemonListItem } from '@app-types/pokemon';
import { PokemonFormSchema, PokemonListResponseSchema } from '@app-types/pokemon';
import { PokemonAbortError, PokemonValidationError, PokemonApiError, PokemonNetworkError, PokemonError } from '@errors';
import { MAX_RESULTS, POKEMON_FORM_ENDPOINT, TOTAL_POKEMON_LIMIT } from '@constants';
import { api } from './api';
import { filterByPrefix } from '@utils/filters';

/**
 * Module-level cache for the Pokemon list to avoid redundant API calls.
 */
let cachedPokemonList: readonly PokemonListItem[] | null = null;

/**
 * Clears the cached Pokemon list. Useful for testing or forcing data refresh.
 */
export function clearPokemonCache(): void {
	cachedPokemonList = null;
}

async function fetchAllPokemons(signal?: AbortSignal): Promise<readonly PokemonListItem[]> {
	// Return cached data if available
	if (cachedPokemonList !== null) {
		return cachedPokemonList;
	}

	try {
		const json: unknown = await api.get(`${POKEMON_FORM_ENDPOINT}?limit=${TOTAL_POKEMON_LIMIT}`, { signal }).json();

		try {
			const data = PokemonListResponseSchema.parse(json);
			// Cache the result for subsequent calls
			cachedPokemonList = Object.freeze(data.results);
			return cachedPokemonList;
		} catch (zodError) {
			throw new PokemonValidationError('Failed to validate Pokemon list', zodError);
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
}

export async function searchPokemonsByName(query: string, signal?: AbortSignal): Promise<PokemonForm[]> {
	const allPokemons = await fetchAllPokemons(signal);

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
