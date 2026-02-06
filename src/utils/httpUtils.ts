import ky, { type HTTPError, type TimeoutError } from 'ky';
import { z } from 'zod';
import {
	PokemonError,
	PokemonApiError,
	PokemonNetworkError,
	PokemonValidationError,
	PokemonAbortError,
	PokemonUnknownError,
} from '@errors';
import { MAX_RETRIES, RETRY_BASE_DELAY_MS, REQUEST_TIMEOUT_MS } from '@constants';

/**
 * Fetches and validates data from a URL using Zod schema.
 * Includes automatic retry with backoff and timeout handling.
 */
export async function fetchAndValidate<T>(url: string, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
	const api = ky.create({
		timeout: REQUEST_TIMEOUT_MS,
		retry: {
			limit: MAX_RETRIES,
			methods: ['get'],
			statusCodes: [408, 413, 429, 500, 502, 503, 504],
			delay: (attemptCount) => RETRY_BASE_DELAY_MS * attemptCount,
		},
	});

	try {
		signal?.throwIfAborted();

		const json: unknown = await api.get(url, { signal }).json();

		try {
			return schema.parse(json);
		} catch (zodError) {
			throw new PokemonValidationError('Failed to validate API response', zodError);
		}
	} catch (error: unknown) {
		// Map ky/fetch errors to our error hierarchy
		if (error instanceof PokemonError) {
			throw error;
		}

		if (error instanceof DOMException && error.name === 'AbortError') {
			throw new PokemonAbortError();
		}

		// Check for ky HTTP errors first (before TypeError check)
		if (error && typeof error === 'object' && 'response' in error) {
			const httpError = error as HTTPError;
			throw new PokemonApiError(
				`API error: ${httpError.response.status} ${httpError.response.statusText}`,
				httpError.response.status
			);
		}

		// ky timeout errors
		if (error && typeof error === 'object' && 'name' in error && error.name === 'TimeoutError') {
			throw new PokemonNetworkError();
		}

		// Network/CORS/DNS errors are TypeError in fetch
		if (error instanceof TypeError) {
			throw new PokemonNetworkError();
		}

		throw new PokemonUnknownError(error instanceof Error ? error.message : 'Unknown error occurred', error);
	}
}
