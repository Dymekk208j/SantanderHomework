import {
  type PokemonListItem,
  type PokemonForm,
  PokemonListResponseSchema,
  PokemonFormSchema,
} from '../types/pokemon';
import { ZodSchema } from 'zod';

// ══════════════════════════════════════
// Constants
// ══════════════════════════════════════

const BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_FORM_ENDPOINT = `${BASE_URL}/pokemon-form`;
const MAX_RESULTS = 5;
const TOTAL_POKEMON_LIMIT = 1500;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 800;

// ══════════════════════════════════════
// Errors
// ══════════════════════════════════════

class PokemonApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly isOffline: boolean = false
  ) {
    super(message);
    this.name = 'PokemonApiError';
  }
}

// ══════════════════════════════════════
// Network layer
// ══════════════════════════════════════

function isRetryable(error: unknown): boolean {
  if (error instanceof PokemonApiError) {
    return error.isOffline || (error.status !== undefined && error.status >= 500);
  }
  return false;
}

function delayWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

async function fetchAndValidate<T>(
  url: string,
  schema: ZodSchema<T>,
  signal?: AbortSignal
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      signal?.throwIfAborted();

      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new PokemonApiError(
          `API error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const json: unknown = await response.json();
      const result = schema.parse(json);
      return result;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      lastError =
        error instanceof TypeError && error.message.includes('fetch')
          ? new PokemonApiError('Network error — check your internet connection', undefined, true)
          : error;

      if (attempt < MAX_RETRIES && isRetryable(lastError)) {
        await delayWithAbort(RETRY_BASE_DELAY_MS * (attempt + 1), signal);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
}

// ══════════════════════════════════════
// Deduped cache
// ══════════════════════════════════════

let cachedListPromise: Promise<readonly PokemonListItem[]> | null = null;

export function clearPokemonCache(): void {
  cachedListPromise = null;
}

function fetchAllPokemonForms(signal?: AbortSignal): Promise<readonly PokemonListItem[]> {
  if (!cachedListPromise) {
    cachedListPromise = fetchAndValidate(
      `${POKEMON_FORM_ENDPOINT}?limit=${TOTAL_POKEMON_LIMIT}`,
      PokemonListResponseSchema,
      signal
    )
      .then((data) => Object.freeze(data.results))
      .catch((error) => {
        cachedListPromise = null;
        throw error;
      });
  }

  return cachedListPromise;
}

// ══════════════════════════════════════
// Search
// ══════════════════════════════════════

function filterByPrefix(
  pokemons: readonly PokemonListItem[],
  query: string
): PokemonListItem[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  const results: PokemonListItem[] = [];
  for (const pokemon of pokemons) {
    if (results.length >= MAX_RESULTS) break;
    if (pokemon.name.startsWith(normalized)) {
      results.push(pokemon);
    }
  }
  return results;
}

export async function searchPokemonsByName(
  query: string,
  signal?: AbortSignal
): Promise<PokemonForm[]> {
  const allPokemons = await fetchAllPokemonForms(signal);
  const matched = filterByPrefix(allPokemons, query);

  if (matched.length === 0) return [];

  const settled = await Promise.allSettled(
    matched.map((pokemon) =>
      fetchAndValidate(pokemon.url, PokemonFormSchema, signal)
    )
  );

  const results: PokemonForm[] = [];

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else if (
      result.reason instanceof DOMException &&
      result.reason.name === 'AbortError'
    ) {
      throw result.reason;
    }
  }

  return results;
}