import { filterByPrefix } from '@utils/filters';

describe('filterByPrefix', () => {
	const mockItems = [
		{ name: 'pikachu' },
		{ name: 'pidgey' },
		{ name: 'charizard' },
		{ name: 'charmander' },
		{ name: 'bulbasaur' },
		{ name: 'squirtle' },
	];

	it('should return empty array when query is empty', () => {
		const result = filterByPrefix(mockItems, '', 10);
		expect(result).toEqual([]);
	});

	it('should return empty array when query is only whitespace', () => {
		const result = filterByPrefix(mockItems, '   ', 10);
		expect(result).toEqual([]);
	});

	it('should filter items by prefix (case insensitive)', () => {
		const result = filterByPrefix(mockItems, 'pi', 10);
		expect(result).toEqual([{ name: 'pikachu' }, { name: 'pidgey' }]);
	});

	it('should be case insensitive', () => {
		const result = filterByPrefix(mockItems, 'PI', 10);
		expect(result).toEqual([{ name: 'pikachu' }, { name: 'pidgey' }]);
	});

	it('should trim the query', () => {
		const result = filterByPrefix(mockItems, '  char  ', 10);
		expect(result).toEqual([{ name: 'charizard' }, { name: 'charmander' }]);
	});

	it('should respect maxResults limit', () => {
		const result = filterByPrefix(mockItems, 'pi', 1);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({ name: 'pikachu' });
	});

	it('should return empty array when no matches found', () => {
		const result = filterByPrefix(mockItems, 'xyz', 10);
		expect(result).toEqual([]);
	});

	it('should match exact name', () => {
		const result = filterByPrefix(mockItems, 'bulbasaur', 10);
		expect(result).toEqual([{ name: 'bulbasaur' }]);
	});

	it('should stop at maxResults even if more items match', () => {
		const manyItems = Array.from({ length: 100 }, (_, i) => ({ name: `pokemon${i}` }));
		const result = filterByPrefix(manyItems, 'pokemon', 5);
		expect(result).toHaveLength(5);
	});

	it('should only match prefix, not substring', () => {
		const items = [
			{ name: 'pikachu' },
			{ name: 'raichu' }, // contains 'chu' but doesn't start with it
		];
		const result = filterByPrefix(items, 'chu', 10);
		expect(result).toEqual([]);
	});
});
