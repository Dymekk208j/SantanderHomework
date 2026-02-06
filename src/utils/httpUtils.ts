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
import { delayWithAbort } from './abortUtils';

/**
 * Combines user abort signal with timeout signal.
 * Returns a combined signal that aborts if either the user signal or timeout fires.
 */
function createTimeoutSignal(userSignal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS): AbortSignal {
	if (!userSignal) {
		return AbortSignal.timeout(timeoutMs);
	}

	const controller = new AbortController();

	// Handler for user abort
	const userAbortHandler = () => controller.abort(userSignal.reason);

	// Abort if user signal fires
	if (userSignal.aborted) {
		controller.abort(userSignal.reason);
	} else {
		userSignal.addEventListener('abort', userAbortHandler, { once: true });
	}

	// Abort on timeout
	const timeoutId = setTimeout(() => controller.abort(new Error('Request timeout')), timeoutMs);

	// Clean up both timeout and listener if aborted early
	controller.signal.addEventListener(
		'abort',
		() => {
			clearTimeout(timeoutId);
			userSignal.removeEventListener('abort', userAbortHandler);
		},
		{ once: true }
	);

	return controller.signal;
}

export async function fetchAndValidate<T>(url: string, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
	let lastError: PokemonError | undefined;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			signal?.throwIfAborted();

			const timeoutSignal = createTimeoutSignal(signal);
			const response = await fetch(url, { signal: timeoutSignal });

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
			} else if (error instanceof TypeError) {
				// Any TypeError from fetch is a network error (CORS, DNS, connection failure, etc.)
				lastError = new PokemonNetworkError();
			} else {
				lastError = new PokemonUnknownError(error instanceof Error ? error.message : 'Unknown error occurred', error);
			}

			if (attempt < MAX_RETRIES && lastError && lastError.isRetryable()) {
				await delayWithAbort(RETRY_BASE_DELAY_MS * (attempt + 1), signal);
				continue;
			}

			throw lastError;
		}
	}

	throw lastError ?? new PokemonUnknownError('Request failed without error details');
}
