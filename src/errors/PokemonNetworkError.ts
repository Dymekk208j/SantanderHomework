import { PokemonError } from './PokemonError';

/** Error thrown when network connectivity fails */
export class PokemonNetworkError extends PokemonError {
	constructor(message: string = 'Network error — check your internet connection') {
		super(message, 'PokemonNetworkError');
	}

	isRetryable(): boolean {
		return true;
	}
}
