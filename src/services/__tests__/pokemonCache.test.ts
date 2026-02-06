import { PokemonCache } from '@services/pokemonCache';
import { api } from '@services/api';
import { PokemonNetworkError } from '@errors';
import { vi } from 'vitest';

vi.mock('@services/api', () => ({
	api: {
		get: vi.fn(),
	},
}));

const mockApiGet = vi.mocked(api.get);

describe('pokemonCache', () => {
	const mockResponse = {
		results: [
			{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-form/25/' },
			{ name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-form/6/' },
		],
	};

	beforeEach(() => {
		PokemonCache.clear();
		vi.clearAllMocks();
	});

	it('should fetch data on first call', async () => {
		const jsonMock = vi.fn().mockResolvedValue(mockResponse);
		mockApiGet.mockReturnValue({ json: jsonMock } as unknown as ReturnType<typeof api.get>);

		const result = await PokemonCache.fetchAll();

		expect(result).toEqual(mockResponse.results);
		expect(mockApiGet).toHaveBeenCalledTimes(1);
		expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('pokemon-form?limit='));
	});

	it('should return cached data on subsequent calls', async () => {
		const jsonMock = vi.fn().mockResolvedValue(mockResponse);
		mockApiGet.mockReturnValue({ json: jsonMock } as unknown as ReturnType<typeof api.get>);

		const result1 = await PokemonCache.fetchAll();
		const result2 = await PokemonCache.fetchAll();
		const result3 = await PokemonCache.fetchAll();

		expect(result1).toEqual(result2);
		expect(result2).toEqual(result3);
		expect(mockApiGet).toHaveBeenCalledTimes(1); // Only called once
	});

	it('should clear cache when PokemonCache.clear is called', async () => {
		const jsonMock = vi.fn().mockResolvedValue(mockResponse);
		mockApiGet.mockReturnValue({ json: jsonMock } as unknown as ReturnType<typeof api.get>);

		await PokemonCache.fetchAll();
		PokemonCache.clear();
		await PokemonCache.fetchAll();

		expect(mockApiGet).toHaveBeenCalledTimes(2);
	});

	it('should clear cache on error', async () => {
		const error = new PokemonNetworkError();
		const jsonMockFail = vi.fn().mockRejectedValue(error);
		const jsonMockSuccess = vi.fn().mockResolvedValue(mockResponse);
		mockApiGet.mockReturnValueOnce({ json: jsonMockFail } as unknown as ReturnType<typeof api.get>);
		mockApiGet.mockReturnValueOnce({ json: jsonMockSuccess } as unknown as ReturnType<typeof api.get>);

		await expect(PokemonCache.fetchAll()).rejects.toThrow(PokemonNetworkError);

		// Cache should be cleared, so next call should fetch again
		await PokemonCache.fetchAll();

		expect(mockApiGet).toHaveBeenCalledTimes(2);
	});

	it('should freeze the results array', async () => {
		const jsonMock = vi.fn().mockResolvedValue(mockResponse);
		mockApiGet.mockReturnValue({ json: jsonMock } as unknown as ReturnType<typeof api.get>);

		const result = await PokemonCache.fetchAll();

		expect(Object.isFrozen(result)).toBe(true);
	});

	it('should share promise for concurrent requests', async () => {
		const jsonMock = vi
			.fn()
			.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100)));
		mockApiGet.mockReturnValue({ json: jsonMock } as unknown as ReturnType<typeof api.get>);

		const promise1 = PokemonCache.fetchAll();
		const promise2 = PokemonCache.fetchAll();
		const promise3 = PokemonCache.fetchAll();

		await Promise.all([promise1, promise2, promise3]);

		expect(mockApiGet).toHaveBeenCalledTimes(1);
	});
});
