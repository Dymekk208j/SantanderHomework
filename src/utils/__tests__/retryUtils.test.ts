import { isRetryable } from '@utils/retryUtils';
import { PokemonApiError, PokemonNetworkError, PokemonValidationError, PokemonAbortError } from '@errors';

describe('isRetryable', () => {
	it('should return true for 5xx API errors', () => {
		const error500 = new PokemonApiError('Internal Server Error', 500);
		const error503 = new PokemonApiError('Service Unavailable', 503);

		expect(isRetryable(error500)).toBe(true);
		expect(isRetryable(error503)).toBe(true);
	});

	it('should return false for 4xx API errors', () => {
		const error400 = new PokemonApiError('Bad Request', 400);
		const error404 = new PokemonApiError('Not Found', 404);

		expect(isRetryable(error400)).toBe(false);
		expect(isRetryable(error404)).toBe(false);
	});

	it('should return true for network errors', () => {
		const networkError = new PokemonNetworkError();
		expect(isRetryable(networkError)).toBe(true);
	});

	it('should return false for validation errors', () => {
		const validationError = new PokemonValidationError('Invalid data', new Error());
		expect(isRetryable(validationError)).toBe(false);
	});

	it('should return false for abort errors', () => {
		const abortError = new PokemonAbortError();
		expect(isRetryable(abortError)).toBe(false);
	});
});
