import type { PokemonListItem } from '@app-types/pokemon';
import { PokemonListResponseSchema } from '@app-types/pokemon';
import { PokemonError, PokemonValidationError, PokemonApiError, PokemonNetworkError } from '@errors';
import { POKEMON_FORM_ENDPOINT, TOTAL_POKEMON_LIMIT } from '@constants';
import { api } from './api';
import type { HTTPError } from 'ky';

/**
 * Singleton cache for Pokemon list data.
 * Implements promise-level caching to avoid duplicate network requests.
 */
export class PokemonCache {
	private static cachedListPromise: Promise<readonly PokemonListItem[]> | null = null;

	/**
	 * Clears the cached Pokemon list, forcing a fresh fetch on next access.
	 */
	public static clear(): void {
		this.cachedListPromise = null;
	}

	/**
	 * Fetches all Pokemon forms. The result is cached - subsequent calls return the same promise.
	 * Note: This method does NOT accept an AbortSignal to avoid sharing abort state between callers.
	 * If you need abort support, wrap the call with your own abort logic (e.g., Promise.race).
	 */
	public static fetchAll(): Promise<readonly PokemonListItem[]> {
		if (!this.cachedListPromise) {
			this.cachedListPromise = api
				.get(`${POKEMON_FORM_ENDPOINT}?limit=${TOTAL_POKEMON_LIMIT}`)
				.json()
				.then((json: unknown) => {
					try {
						const data = PokemonListResponseSchema.parse(json);
						return Object.freeze(data.results);
					} catch (zodError) {
						throw new PokemonValidationError('Failed to validate Pokemon list', zodError);
					}
				})
				.catch((error: unknown) => {
					this.cachedListPromise = null;

					if (error instanceof PokemonError) {
						throw error;
					}

					if (error && typeof error === 'object' && 'response' in error) {
						const httpError = error as HTTPError;
						throw new PokemonApiError(
							`API error: ${httpError.response.status} ${httpError.response.statusText}`,
							httpError.response.status
						);
					}

					throw new PokemonNetworkError();
				});
		}

		return this.cachedListPromise;
	}
}
