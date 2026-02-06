import { PokemonError, PokemonApiError, PokemonNetworkError } from '../errors';

export function isRetryable(error: PokemonError): boolean {
	return (error instanceof PokemonApiError && error.isRetryable()) || error instanceof PokemonNetworkError;
}
