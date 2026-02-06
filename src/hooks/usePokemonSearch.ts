import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { debounceTime, switchMap, catchError, map, distinctUntilChanged, tap, startWith } from 'rxjs/operators';
import type { PokemonForm } from '@app-types/pokemon';
import { searchPokemonsByName } from '@services/pokemonService';
import { PokemonAbortError, PokemonError } from '@errors';
import type { UsePokemonSearchResult } from '@app-types/UsePokemonSearchResult';

const EMPTY_RESULTS: readonly PokemonForm[] = [];

interface SearchState {
	results: readonly PokemonForm[];
	isLoading: boolean;
	error: string | null;
	isRetryable: boolean;
}

export function usePokemonSearch(): UsePokemonSearchResult {
	const [query, setQuery] = useState('');
	const [state, setState] = useState<SearchState>({
		results: [],
		isLoading: false,
		error: null,
		isRetryable: false,
	});

	const querySubject$ = useMemo(() => new BehaviorSubject<string>(''), []);
	const retrySubject$ = useMemo(() => new BehaviorSubject<number>(0), []);
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		querySubject$.next(query);
	}, [query, querySubject$]);

	useEffect(() => {
		const subscription = combineLatest([querySubject$, retrySubject$])
			.pipe(
				map(([q, r]) => ({ query: q.trim(), retry: r })),
				debounceTime(300),
				distinctUntilChanged((a, b) => a.query === b.query && a.retry === b.retry),
				tap(() => {
					abortControllerRef.current?.abort();
				}),
				switchMap(({ query }) => {
					if (!query) {
						return of({
							results: EMPTY_RESULTS,
							isLoading: false,
							error: null,
							isRetryable: false,
						});
					}

					const controller = new AbortController();
					abortControllerRef.current = controller;

					return from(searchPokemonsByName(query, controller.signal)).pipe(
						map((results) => ({
							results,
							isLoading: false,
							error: null,
							isRetryable: false,
						})),
						catchError((err: unknown) => {
							if (err instanceof PokemonAbortError) {
								return of({
									results: EMPTY_RESULTS,
									isLoading: false,
									error: null,
									isRetryable: false,
								});
							}

							const isRetryable = err instanceof PokemonError && err.isRetryable();

							return of({
								results: EMPTY_RESULTS,
								isLoading: false,
								error: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
								isRetryable,
							});
						}),
						startWith({
							results: EMPTY_RESULTS,
							isLoading: true,
							error: null,
							isRetryable: false,
						})
					);
				})
			)
			.subscribe(setState);

		return () => {
			subscription.unsubscribe();
			abortControllerRef.current?.abort();
			querySubject$.complete();
			retrySubject$.complete();
		};
	}, [querySubject$, retrySubject$]);

	const retry = useCallback(() => {
		retrySubject$.next(retrySubject$.value + 1);
	}, [retrySubject$]);

	return {
		query,
		setQuery,
		results: state.results,
		isLoading: state.isLoading,
		error: state.error,
		isRetryable: state.isRetryable,
		retry,
	};
}
