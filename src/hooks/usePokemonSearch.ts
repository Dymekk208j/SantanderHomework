import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PokemonForm, UsePokemonSearchResult } from '@app-types';
import { searchPokemonsByName } from '@services/pokemonService';
import { PokemonAbortError, PokemonError } from '@errors';
import { useDebounce } from './useDebounce';

export function usePokemonSearch(): UsePokemonSearchResult {
	const [query, setQuery] = useState('');
	const debouncedQuery = useDebounce(query.trim(), 300);

	const { data, isLoading, error, refetch } = useQuery<PokemonForm[], Error>({
		queryKey: ['pokemon', debouncedQuery],
		queryFn: async ({ signal }) => {
			if (!debouncedQuery) return [];
			return searchPokemonsByName(debouncedQuery, signal);
		},
		enabled: debouncedQuery.length > 0,
		retry: (failureCount, error) => {
			// Don't retry on abort errors
			if (error instanceof PokemonAbortError) return false;
			// Retry only if error is retryable and we haven't exceeded max attempts
			return error instanceof PokemonError && error.isRetryable() && failureCount < 2;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	const isRetryable = error instanceof PokemonError && error.isRetryable();

	return {
		query,
		setQuery,
		results: data ?? [],
		isLoading,
		error: error?.message ?? null,
		isRetryable,
		retry: () => {
			void refetch();
		},
	};
}
