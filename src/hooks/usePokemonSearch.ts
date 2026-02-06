import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { debounceTime, switchMap, catchError, map, distinctUntilChanged, tap, startWith } from 'rxjs/operators';
import type { PokemonForm } from '@app-types/pokemon';
import { searchPokemonsByName } from '@services/pokemonService';
import { PokemonAbortError } from '@errors';
import type { UsePokemonSearchResult } from '@interfaces/UsePokemonSearchResult';

const EMPTY_RESULTS: readonly PokemonForm[] = [];

interface SearchState {
	results: readonly PokemonForm[];
	isLoading: boolean;
	error: string | null;
}

export function usePokemonSearch(): UsePokemonSearchResult {
	const [query, setQuery] = useState('');
	const [state, setState] = useState<SearchState>({
		results: [],
		isLoading: false,
		error: null,
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
						});
					}

					const controller = new AbortController();
					abortControllerRef.current = controller;

					return from(searchPokemonsByName(query, controller.signal)).pipe(
						map((results) => ({
							results,
							isLoading: false,
							error: null,
						})),
						catchError((err: unknown) => {
							if (err instanceof PokemonAbortError) {
								return of({
									results: [] as readonly PokemonForm[],
									isLoading: false,
									error: null,
								});
							}

							return of({
								results: [] as readonly PokemonForm[],
								isLoading: false,
								error: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
							});
						}),
						startWith({
							results: [] as readonly PokemonForm[],
							isLoading: true,
							error: null,
						})
					);
				})
			)
			.subscribe(setState);

		return () => {
			subscription.unsubscribe();
			abortControllerRef.current?.abort();
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
		retry,
	};
}
