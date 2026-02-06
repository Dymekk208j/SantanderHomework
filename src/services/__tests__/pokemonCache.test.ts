import { fetchAllPokemonForms, clearPokemonCache } from '@services/pokemonCache';
import { fetchAndValidate } from '@utils/httpUtils';
import { PokemonNetworkError } from '@errors';
import { vi, type Mock } from 'vitest';

vi.mock('@utils/httpUtils');

const mockedFetchAndValidate = fetchAndValidate as Mock<typeof fetchAndValidate>;

describe('pokemonCache', () => {
	const mockResponse = {
		results: [
			{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-form/25/' },
			{ name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-form/6/' },
		],
	};

	beforeEach(() => {
		clearPokemonCache();
		vi.clearAllMocks();
	});

	it('should fetch data on first call', async () => {
		mockedFetchAndValidate.mockResolvedValue(mockResponse);

		const result = await fetchAllPokemonForms();

		expect(result).toEqual(mockResponse.results);
		expect(mockedFetchAndValidate).toHaveBeenCalledTimes(1);
		expect(mockedFetchAndValidate).toHaveBeenCalledWith(
			expect.stringContaining('pokemon-form?limit='),
			expect.anything()
		);
	});

	it('should return cached data on subsequent calls', async () => {
		mockedFetchAndValidate.mockResolvedValue(mockResponse);

		const result1 = await fetchAllPokemonForms();
		const result2 = await fetchAllPokemonForms();
		const result3 = await fetchAllPokemonForms();

		expect(result1).toEqual(result2);
		expect(result2).toEqual(result3);
		expect(mockedFetchAndValidate).toHaveBeenCalledTimes(1); // Only called once
	});

	it('should clear cache when clearPokemonCache is called', async () => {
		mockedFetchAndValidate.mockResolvedValue(mockResponse);

		await fetchAllPokemonForms();
		clearPokemonCache();
		await fetchAllPokemonForms();

		expect(mockedFetchAndValidate).toHaveBeenCalledTimes(2);
	});

	it('should clear cache on error', async () => {
		const error = new PokemonNetworkError();
		mockedFetchAndValidate.mockRejectedValueOnce(error);
		mockedFetchAndValidate.mockResolvedValueOnce(mockResponse);

		await expect(fetchAllPokemonForms()).rejects.toThrow(error);

		// Cache should be cleared, so next call should fetch again
		await fetchAllPokemonForms();

		expect(mockedFetchAndValidate).toHaveBeenCalledTimes(2);
	});

	it('should freeze the results array', async () => {
		mockedFetchAndValidate.mockResolvedValue(mockResponse);

		const result = await fetchAllPokemonForms();

		expect(Object.isFrozen(result)).toBe(true);
	});

	it('should share promise for concurrent requests', async () => {
		mockedFetchAndValidate.mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
		);

		const promise1 = fetchAllPokemonForms();
		const promise2 = fetchAllPokemonForms();
		const promise3 = fetchAllPokemonForms();

		await Promise.all([promise1, promise2, promise3]);

		expect(mockedFetchAndValidate).toHaveBeenCalledTimes(1);
	});
});
