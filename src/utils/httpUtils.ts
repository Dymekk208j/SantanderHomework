import { ZodSchema } from 'zod';
import {
	PokemonError,
	PokemonApiError,
	PokemonNetworkError,
	PokemonValidationError,
	PokemonAbortError,
	PokemonUnknownError,
} from '../errors';
import { MAX_RETRIES, RETRY_BASE_DELAY_MS } from '../constants';
import { isRetryable } from './retryUtils';
import { delayWithAbort } from './abortUtils';

export async function fetchAndValidate<T>(url: string, schema: ZodSchema<T>, signal?: AbortSignal): Promise<T> {
	let lastError: PokemonError | undefined;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			signal?.throwIfAborted();

			const response = await fetch(url, { signal });

			if (!response.ok) {
				throw new PokemonApiError(`API error: ${response.status} ${response.statusText}`, response.status);
			}

			const json: unknown = await response.json();

			try {
				const result = schema.parse(json);
				return result;
			} catch (zodError) {
				throw new PokemonValidationError('Failed to validate API response', zodError);
			}
		} catch (error: unknown) {
			// Convert unknown errors to our error hierarchy
			if (error instanceof PokemonError) {
				lastError = error;
			} else if (error instanceof DOMException && error.name === 'AbortError') {
				throw new PokemonAbortError();
			} else if (error instanceof TypeError && error.message.includes('fetch')) {
				lastError = new PokemonNetworkError();
			} else {
				lastError = new PokemonUnknownError(error instanceof Error ? error.message : 'Unknown error occurred', error);
			}

			if (attempt < MAX_RETRIES && lastError && isRetryable(lastError)) {
				await delayWithAbort(RETRY_BASE_DELAY_MS * (attempt + 1), signal);
				continue;
			}

			throw lastError;
		}
	}

	throw lastError ?? new PokemonUnknownError('Request failed without error details');
}
