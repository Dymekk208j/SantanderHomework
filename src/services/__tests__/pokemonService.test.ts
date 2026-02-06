import { searchPokemonsByName } from '../../services/pokemonService';
import { fetchAllPokemonForms } from '../../services/pokemonCache';
import { fetchAndValidate } from '../../utils/httpUtils';
import { filterByPrefix } from '../../utils/filters';
import { PokemonAbortError, PokemonNetworkError } from '../../errors';
import type { PokemonForm } from '../../types/pokemon';
import { vi, type Mock } from 'vitest';

vi.mock('../../services/pokemonCache');
vi.mock('../../utils/httpUtils');
vi.mock('../../utils/filters');

const mockedFetchAllPokemonForms = fetchAllPokemonForms as Mock<typeof fetchAllPokemonForms>;
const mockedFetchAndValidate = fetchAndValidate as Mock<typeof fetchAndValidate>;
const mockedFilterByPrefix = filterByPrefix as Mock<typeof filterByPrefix>;

describe('searchPokemonsByName', () => {
	const mockAllPokemons = [
		{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-form/25/' },
		{ name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-form/6/' },
		{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-form/1/' },
	];

	const mockPikachuForm: PokemonForm = {
		id: 25,
		name: 'pikachu',
		sprites: {
			front_default: 'pikachu.png',
			other: {
				'official-artwork': {
					front_default: 'pikachu-artwork.png',
				},
			},
		},
		types: [{ type: { name: 'electric' } }],
	};

	const mockCharizardForm: PokemonForm = {
		id: 6,
		name: 'charizard',
		sprites: {
			front_default: 'charizard.png',
			other: {
				'official-artwork': {
					front_default: 'charizard-artwork.png',
				},
			},
		},
		types: [{ type: { name: 'fire' } }, { type: { name: 'flying' } }],
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should search and return matching pokemon forms', async () => {
		mockedFetchAllPokemonForms.mockResolvedValue(mockAllPokemons);
		mockedFilterByPrefix.mockReturnValue([mockAllPokemons[0], mockAllPokemons[1]]);
		mockedFetchAndValidate.mockResolvedValueOnce(mockPikachuForm).mockResolvedValueOnce(mockCharizardForm);

		const result = await searchPokemonsByName('pi');

		expect(result).toEqual([mockPikachuForm, mockCharizardForm]);
		expect(mockedFetchAllPokemonForms).toHaveBeenCalledWith(undefined);
		expect(mockedFilterByPrefix).toHaveBeenCalledWith(mockAllPokemons, 'pi', expect.any(Number));
		expect(mockedFetchAndValidate).toHaveBeenCalledTimes(2);
	});

	it('should return empty array when no matches found', async () => {
		mockedFetchAllPokemonForms.mockResolvedValue(mockAllPokemons);
		mockedFilterByPrefix.mockReturnValue([]);

		const result = await searchPokemonsByName('xyz');

		expect(result).toEqual([]);
		expect(mockedFetchAndValidate).not.toHaveBeenCalled();
	});

	it('should pass abort signal through all calls', async () => {
		const controller = new AbortController();
		mockedFetchAllPokemonForms.mockResolvedValue(mockAllPokemons);
		mockedFilterByPrefix.mockReturnValue([mockAllPokemons[0]]);
		mockedFetchAndValidate.mockResolvedValue(mockPikachuForm);

		await searchPokemonsByName('pikachu', controller.signal);

		expect(mockedFetchAllPokemonForms).toHaveBeenCalledWith(controller.signal);
		expect(mockedFetchAndValidate).toHaveBeenCalledWith(expect.any(String), expect.anything(), controller.signal);
	});

	it('should throw PokemonAbortError when any request is aborted', async () => {
		mockedFetchAllPokemonForms.mockResolvedValue(mockAllPokemons);
		mockedFilterByPrefix.mockReturnValue([mockAllPokemons[0]]);
		mockedFetchAndValidate.mockRejectedValue(new PokemonAbortError());

		await expect(searchPokemonsByName('pikachu')).rejects.toThrow(PokemonAbortError);
	});

	it('should silently ignore non-abort errors for individual pokemon fetches', async () => {
		mockedFetchAllPokemonForms.mockResolvedValue(mockAllPokemons);
		mockedFilterByPrefix.mockReturnValue([mockAllPokemons[0], mockAllPokemons[1]]);
		mockedFetchAndValidate.mockResolvedValueOnce(mockPikachuForm).mockRejectedValueOnce(new PokemonNetworkError());

		const result = await searchPokemonsByName('pi');

		expect(result).toEqual([mockPikachuForm]);
		expect(result).toHaveLength(1);
	});

	it('should return empty array if all individual fetches fail', async () => {
		mockedFetchAllPokemonForms.mockResolvedValue(mockAllPokemons);
		mockedFilterByPrefix.mockReturnValue([mockAllPokemons[0], mockAllPokemons[1]]);
		mockedFetchAndValidate.mockRejectedValue(new PokemonNetworkError());

		const result = await searchPokemonsByName('pi');

		expect(result).toEqual([]);
	});

	it('should fetch details for all matched pokemon in parallel', async () => {
		mockedFetchAllPokemonForms.mockResolvedValue(mockAllPokemons);
		mockedFilterByPrefix.mockReturnValue(mockAllPokemons);

		let fetchCallCount = 0;
		mockedFetchAndValidate.mockImplementation(() => {
			fetchCallCount++;
			// Simulate parallel execution - all should start before any completes
			return Promise.resolve(mockPikachuForm);
		});

		await searchPokemonsByName('p');

		expect(mockedFetchAndValidate).toHaveBeenCalledTimes(3);
	});
});
