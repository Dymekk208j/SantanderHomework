import { fetchAndValidate } from '../../utils/httpUtils';
import { z } from 'zod';
import { PokemonApiError, PokemonNetworkError, PokemonValidationError, PokemonAbortError } from '../../errors';
import { vi, type Mock } from 'vitest';

// Mock delay to avoid waiting in tests
vi.mock('../../utils/abortUtils', () => ({
	delayWithAbort: vi.fn(() => Promise.resolve()),
}));

describe('fetchAndValidate', () => {
	const mockSchema = z.object({
		name: z.string(),
		id: z.number(),
	});

	const mockUrl = 'https://pokeapi.co/api/v2/pokemon/1';
	const validData = { name: 'bulbasaur', id: 1 };

	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should successfully fetch and validate data', async () => {
		(global.fetch as Mock).mockResolvedValue({
			ok: true,
			json: async () => validData,
		});

		const result = await fetchAndValidate(mockUrl, mockSchema);

		expect(result).toEqual(validData);
		expect(global.fetch).toHaveBeenCalledTimes(1);
		expect(global.fetch).toHaveBeenCalledWith(mockUrl, { signal: undefined });
	});

	it('should throw PokemonApiError on non-OK response', async () => {
		(global.fetch as Mock).mockResolvedValue({
			ok: false,
			status: 404,
			statusText: 'Not Found',
		});

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonApiError);
		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow('API error: 404 Not Found');
	});

	it('should throw PokemonValidationError on schema validation failure', async () => {
		(global.fetch as Mock).mockResolvedValue({
			ok: true,
			json: async () => ({ invalid: 'data' }),
		});

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonValidationError);
	});

	it('should throw PokemonAbortError when aborted', async () => {
		const abortError = new DOMException('Aborted', 'AbortError');
		(global.fetch as Mock).mockRejectedValue(abortError);

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonAbortError);
	});

	it('should throw PokemonNetworkError on network failure', async () => {
		const networkError = new TypeError('Failed to fetch');
		(global.fetch as Mock).mockRejectedValue(networkError);

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonNetworkError);
	});

	it('should retry on 5xx errors', async () => {
		(global.fetch as Mock)
			.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
			})
			.mockResolvedValueOnce({
				ok: false,
				status: 503,
				statusText: 'Service Unavailable',
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => validData,
			});

		const result = await fetchAndValidate(mockUrl, mockSchema);

		expect(result).toEqual(validData);
		expect(global.fetch).toHaveBeenCalledTimes(3);
	});

	it('should not retry on 4xx errors', async () => {
		(global.fetch as Mock).mockResolvedValue({
			ok: false,
			status: 404,
			statusText: 'Not Found',
		});

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonApiError);
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it('should retry on network errors', async () => {
		const networkError = new TypeError('Failed to fetch');
		(global.fetch as Mock).mockRejectedValueOnce(networkError).mockResolvedValueOnce({
			ok: true,
			json: async () => validData,
		});

		const result = await fetchAndValidate(mockUrl, mockSchema);

		expect(result).toEqual(validData);
		expect(global.fetch).toHaveBeenCalledTimes(2);
	});

	it('should respect max retries limit', async () => {
		(global.fetch as Mock).mockResolvedValue({
			ok: false,
			status: 500,
			statusText: 'Internal Server Error',
		});

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonApiError);

		// Initial attempt + MAX_RETRIES (which is 2)
		expect(global.fetch).toHaveBeenCalledTimes(3);
	});

	it('should pass abort signal to fetch', async () => {
		const controller = new AbortController();
		(global.fetch as Mock).mockResolvedValue({
			ok: true,
			json: async () => validData,
		});

		await fetchAndValidate(mockUrl, mockSchema, controller.signal);

		expect(global.fetch).toHaveBeenCalledWith(mockUrl, { signal: controller.signal });
	});

	it('should check signal before each retry attempt', async () => {
		const controller = new AbortController();
		controller.abort();

		await expect(fetchAndValidate(mockUrl, mockSchema, controller.signal)).rejects.toThrow(PokemonAbortError);
	});
});
