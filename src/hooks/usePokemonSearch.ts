import { useState, useEffect, useRef } from 'react';
import { BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { debounceTime, switchMap, catchError, map, distinctUntilChanged, tap, startWith } from 'rxjs/operators';
import type { PokemonForm } from '../types/pokemon';
import { searchPokemonsByName } from '../services/pokemonService';
import { PokemonAbortError } from '../errors';
import type { UsePokemonSearchResult } from '../interfaces/UsePokemonSearchResult';

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

	const querySubject$ = useRef(new BehaviorSubject<string>('')).current;
	const retrySubject$ = useRef(new BehaviorSubject<number>(0)).current;
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		querySubject$.next(query);
	}, [query, querySubject$]);

	useEffect(() => {
		const subscription = combineLatest([querySubject$, retrySubject$])
			.pipe(
				map(([q]) => q.trim()),
				debounceTime(300),
				distinctUntilChanged(),
				tap(() => {
					abortControllerRef.current?.abort();
				}),
				switchMap((trimmedQuery) => {
					if (!trimmedQuery) {
						return of({
							results: [] as readonly PokemonForm[],
							isLoading: false,
							error: null,
						});
					}

					const controller = new AbortController();
					abortControllerRef.current = controller;

					return from(searchPokemonsByName(trimmedQuery, controller.signal)).pipe(
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

	const retry = () => {
		retrySubject$.next(retrySubject$.value + 1);
	};

	return {
		query,
		setQuery,
		results: state.results,
		isLoading: state.isLoading,
		error: state.error,
		retry,
	};
}
