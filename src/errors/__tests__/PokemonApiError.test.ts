import { PokemonApiError } from '../../errors/PokemonApiError';

describe('PokemonApiError', () => {
	describe('isRetryable', () => {
		it('should return true for status >= 500', () => {
			const error500 = new PokemonApiError('Internal Server Error', 500);
			const error502 = new PokemonApiError('Bad Gateway', 502);
			const error503 = new PokemonApiError('Service Unavailable', 503);
			const error599 = new PokemonApiError('Custom Server Error', 599);

			expect(error500.isRetryable()).toBe(true);
			expect(error502.isRetryable()).toBe(true);
			expect(error503.isRetryable()).toBe(true);
			expect(error599.isRetryable()).toBe(true);
		});

		it('should return false for status < 500', () => {
			const error400 = new PokemonApiError('Bad Request', 400);
			const error401 = new PokemonApiError('Unauthorized', 401);
			const error404 = new PokemonApiError('Not Found', 404);
			const error499 = new PokemonApiError('Custom Client Error', 499);

			expect(error400.isRetryable()).toBe(false);
			expect(error401.isRetryable()).toBe(false);
			expect(error404.isRetryable()).toBe(false);
			expect(error499.isRetryable()).toBe(false);
		});

		it('should store status code', () => {
			const error = new PokemonApiError('Test error', 404);
			expect(error.status).toBe(404);
		});

		it('should have correct error name', () => {
			const error = new PokemonApiError('Test error', 500);
			expect(error.name).toBe('PokemonApiError');
		});
	});
});
