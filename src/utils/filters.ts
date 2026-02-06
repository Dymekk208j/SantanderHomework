interface FilterableItem {
	readonly name: string;
}

export function filterByPrefix<T extends FilterableItem>(items: readonly T[], query: string, maxResults: number): T[] {
	const normalized = query.toLowerCase().trim();
	if (!normalized) return [];

	const results: T[] = [];
	for (const item of items) {
		if (results.length >= maxResults) break;
		if (item.name.toLowerCase().startsWith(normalized)) {
			results.push(item);
		}
	}
	return results;
}
