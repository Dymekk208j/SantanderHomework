import { PokemonError } from './PokemonError';

/** Error thrown when a request is aborted */
export class PokemonAbortError extends PokemonError {
	constructor(message: string = 'Request was aborted') {
		super(message, 'PokemonAbortError');
	}

	isRetryable(): boolean {
		return false;
	}
}
