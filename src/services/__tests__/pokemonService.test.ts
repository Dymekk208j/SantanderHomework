import { searchPokemonsByName } from '@services/pokemonService';
import { api } from '@services/api';
import { filterByPrefix } from '@utils/filters';
import { PokemonAbortError, PokemonNetworkError } from '@errors';
import type { PokemonForm } from '@app-types/pokemon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@services/api', () => ({
	api: {
		get: vi.fn(),
	},
}));
vi.mock('@utils/filters');

const mockApiGet = vi.mocked(api.get);
const mockedFilterByPrefix = vi.mocked(filterByPrefix);

describe('searchPokemonsByName', () => {
	const mockAllPokemons = [
		{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-form/25/' },
		{ name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-form/6/' },
		{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-form/1/' },
	];

	const mockListResponse = {
		results: mockAllPokemons,
	};

	const mockPikachuForm: PokemonForm = {
		id: 25,
		name: 'pikachu',
		sprites: {
			front_default: 'https://example.com/pikachu.png',
		},
	};

	const mockCharizardForm: PokemonForm = {
		id: 6,
		name: 'charizard',
		sprites: {
			front_default: 'https://example.com/charizard.png',
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should search and return matching pokemon forms', async () => {
		const listJsonMock = vi.fn().mockResolvedValue(mockListResponse);
		const jsonMock1 = vi.fn().mockResolvedValue(mockPikachuForm);
		const jsonMock2 = vi.fn().mockResolvedValue(mockCharizardForm);

		mockApiGet
			.mockReturnValueOnce({ json: listJsonMock } as unknown as ReturnType<typeof api.get>)
			.mockReturnValueOnce({ json: jsonMock1 } as unknown as ReturnType<typeof api.get>)
			.mockReturnValueOnce({ json: jsonMock2 } as unknown as ReturnType<typeof api.get>);

		mockedFilterByPrefix.mockReturnValue([mockAllPokemons[0]!, mockAllPokemons[1]!]);

		const result = await searchPokemonsByName('pi');

		expect(result).toEqual([mockPikachuForm, mockCharizardForm]);
		expect(mockedFilterByPrefix).toHaveBeenCalledWith(mockAllPokemons, 'pi', expect.any(Number));
		expect(mockApiGet).toHaveBeenCalledTimes(3); // 1 for list + 2 for individual pokemon
	});

	it('should return empty array when no matches found', async () => {
		const listJsonMock = vi.fn().mockResolvedValue(mockListResponse);
		mockApiGet.mockReturnValueOnce({ json: listJsonMock } as unknown as ReturnType<typeof api.get>);
		mockedFilterByPrefix.mockReturnValue([]);

		const result = await searchPokemonsByName('xyz');

		expect(result).toEqual([]);
		expect(mockApiGet).toHaveBeenCalledTimes(1); // Only the list call
	});

	it('should pass abort signal through all calls', async () => {
		const controller = new AbortController();
		const listJsonMock = vi.fn().mockResolvedValue(mockListResponse);
		const jsonMock = vi.fn().mockResolvedValue(mockPikachuForm);

		mockApiGet
			.mockReturnValueOnce({ json: listJsonMock } as unknown as ReturnType<typeof api.get>)
			.mockReturnValueOnce({ json: jsonMock } as unknown as ReturnType<typeof api.get>);

		mockedFilterByPrefix.mockReturnValue([mockAllPokemons[0]!]);

		await searchPokemonsByName('pikachu', controller.signal);

		expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('pokemon-form?limit='), { signal: controller.signal });
		expect(mockApiGet).toHaveBeenCalledWith(expect.any(String), { signal: controller.signal });
	});

	it('should throw PokemonAbortError when any request is aborted', async () => {
		const listJsonMock = vi.fn().mockResolvedValue(mockListResponse);
		const jsonMock = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));

		mockApiGet
			.mockReturnValueOnce({ json: listJsonMock } as unknown as ReturnType<typeof api.get>)
			.mockReturnValueOnce({ json: jsonMock } as unknown as ReturnType<typeof api.get>);

		mockedFilterByPrefix.mockReturnValue([mockAllPokemons[0]!]);

		await expect(searchPokemonsByName('pikachu')).rejects.toThrow(PokemonAbortError);
	});

	it('should silently ignore non-abort errors for individual pokemon fetches', async () => {
		const listJsonMock = vi.fn().mockResolvedValue(mockListResponse);
		const jsonMock1 = vi.fn().mockResolvedValue(mockPikachuForm);
		const jsonMock2 = vi.fn().mockRejectedValue(new PokemonNetworkError());

		mockApiGet
			.mockReturnValueOnce({ json: listJsonMock } as unknown as ReturnType<typeof api.get>)
			.mockReturnValueOnce({ json: jsonMock1 } as unknown as ReturnType<typeof api.get>)
			.mockReturnValueOnce({ json: jsonMock2 } as unknown as ReturnType<typeof api.get>);

		mockedFilterByPrefix.mockReturnValue([mockAllPokemons[0]!, mockAllPokemons[1]!]);

		const result = await searchPokemonsByName('pi');

		expect(result).toEqual([mockPikachuForm]);
		expect(result).toHaveLength(1);
	});

	it('should return empty array if all individual fetches fail', async () => {
		const listJsonMock = vi.fn().mockResolvedValue(mockListResponse);
		const jsonMock = vi.fn().mockRejectedValue(new PokemonNetworkError());

		mockApiGet
			.mockReturnValueOnce({ json: listJsonMock } as unknown as ReturnType<typeof api.get>)
			.mockReturnValue({ json: jsonMock } as unknown as ReturnType<typeof api.get>);

		mockedFilterByPrefix.mockReturnValue([mockAllPokemons[0]!, mockAllPokemons[1]!]);

		const result = await searchPokemonsByName('pi');

		expect(result).toEqual([]);
	});

	it('should fetch details for all matched pokemon in parallel', async () => {
		const listJsonMock = vi.fn().mockResolvedValue(mockListResponse);
		const jsonMock = vi.fn().mockResolvedValue(mockPikachuForm);

		mockApiGet
			.mockReturnValueOnce({ json: listJsonMock } as unknown as ReturnType<typeof api.get>)
			.mockReturnValue({ json: jsonMock } as unknown as ReturnType<typeof api.get>);

		mockedFilterByPrefix.mockReturnValue(mockAllPokemons);

		await searchPokemonsByName('p');

		expect(mockApiGet).toHaveBeenCalledTimes(4); // 1 for list + 3 for individual pokemon
	});
});
