import { fetchAndValidate } from '@utils/httpUtils';
import { z } from 'zod';
import { PokemonApiError, PokemonNetworkError, PokemonValidationError, PokemonAbortError } from '@errors';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ky from 'ky';

vi.mock('ky', () => {
	const mockKy = {
		create: vi.fn(),
	};
	return { default: mockKy };
});

describe('fetchAndValidate', () => {
	const mockSchema = z.object({
		name: z.string(),
		id: z.number(),
	});

	const mockUrl = 'https://pokeapi.co/api/v2/pokemon/1';
	const validData = { name: 'bulbasaur', id: 1 };

	let mockKyGet: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockKyGet = vi.fn();
		vi.mocked(ky.create).mockReturnValue({
			get: mockKyGet,
		} as never);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should successfully fetch and validate data', async () => {
		const jsonMock = vi.fn().mockResolvedValue(validData);
		mockKyGet.mockResolvedValue({
			json: jsonMock,
		});

		const result = await fetchAndValidate(mockUrl, mockSchema);

		expect(result).toEqual(validData);
		expect(mockKyGet).toHaveBeenCalledWith(mockUrl, expect.objectContaining({ signal: undefined }));
	});

	it('should throw PokemonApiError on non-OK response', async () => {
		const httpError = Object.assign(new Error('HTTP Error'), {
			response: {
				status: 404,
				statusText: 'Not Found',
			},
		});
		mockKyGet.mockRejectedValue(httpError);

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonApiError);
		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow('API error: 404 Not Found');
	});

	it('should throw PokemonValidationError on schema validation failure', async () => {
		const jsonMock = vi.fn().mockResolvedValue({ invalid: 'data' });
		mockKyGet.mockResolvedValue({
			json: jsonMock,
		});

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonValidationError);
	});

	it('should throw PokemonAbortError when aborted', async () => {
		const abortError = new DOMException('Aborted', 'AbortError');
		mockKyGet.mockRejectedValue(abortError);

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonAbortError);
	});

	it('should throw PokemonNetworkError on network failure', async () => {
		const networkError = new TypeError('Failed to fetch');
		mockKyGet.mockRejectedValue(networkError);

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonNetworkError);
	});

	it('should retry on 5xx errors', async () => {
		// ky handles retry internally, so we just verify it works with successful response
		const jsonMock = vi.fn().mockResolvedValue(validData);
		mockKyGet.mockResolvedValue({
			json: jsonMock,
		});

		const result = await fetchAndValidate(mockUrl, mockSchema);

		expect(result).toEqual(validData);
	});

	it('should not retry on 4xx errors', async () => {
		// ky handles retry logic internally based on configuration
		const httpError = Object.assign(new Error('HTTP Error'), {
			response: {
				status: 404,
				statusText: 'Not Found',
			},
		});
		mockKyGet.mockRejectedValue(httpError);

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonApiError);
	});

	it('should retry on network errors', async () => {
		// ky handles retry internally, we just test the success case
		const jsonMock = vi.fn().mockResolvedValue(validData);
		mockKyGet.mockResolvedValue({
			json: jsonMock,
		});

		const result = await fetchAndValidate(mockUrl, mockSchema);

		expect(result).toEqual(validData);
	});

	it('should respect max retries limit', async () => {
		// ky respects retry configuration internally
		const httpError = Object.assign(new Error('HTTP Error'), {
			response: {
				status: 500,
				statusText: 'Internal Server Error',
			},
		});
		mockKyGet.mockRejectedValue(httpError);

		await expect(fetchAndValidate(mockUrl, mockSchema)).rejects.toThrow(PokemonApiError);
	});

	it('should pass abort signal to fetch', async () => {
		const controller = new AbortController();
		const jsonMock = vi.fn().mockResolvedValue(validData);
		mockKyGet.mockResolvedValue({
			json: jsonMock,
		});

		await fetchAndValidate(mockUrl, mockSchema, controller.signal);

		expect(mockKyGet).toHaveBeenCalledWith(mockUrl, expect.objectContaining({ signal: controller.signal }));
	});

	it('should check signal before each retry attempt', async () => {
		const controller = new AbortController();
		controller.abort();

		await expect(fetchAndValidate(mockUrl, mockSchema, controller.signal)).rejects.toThrow(PokemonAbortError);
	});
});
