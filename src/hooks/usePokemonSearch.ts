import { useState, useEffect, useRef, useCallback } from 'react';
import type { PokemonForm } from '../types/pokemon';
import { searchPokemonsByName } from '../services/pokemonService';
import { useDebounce } from './useDebounce';

interface UsePokemonSearchResult {
  readonly query: string;
  readonly setQuery: (value: string) => void;
  readonly results: readonly PokemonForm[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly retry: () => void;
}

export function usePokemonSearch(): UsePokemonSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<readonly PokemonForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const debouncedQuery = useDebounce(query);
  const abortControllerRef = useRef<AbortController | null>(null);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    abortControllerRef.current?.abort();

    const trimmedQuery = debouncedQuery.trim();

    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let isCancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const pokemons = await searchPokemonsByName(
          trimmedQuery,
          abortController.signal
        );

        if (!isCancelled) {
          setResults(pokemons);
        }
      } catch (err) {
        if (isCancelled) return;

        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Please try again.'
        );
        setResults([]);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [debouncedQuery, retryCount]);

  return { query, setQuery, results, isLoading, error, retry };
}