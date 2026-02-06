import { PokemonError } from './PokemonError';

/** Error thrown for unexpected errors that don't fit other categories */
export class PokemonUnknownError extends PokemonError {
	constructor(
		message: string = 'An unexpected error occurred',
		public readonly originalError?: unknown
	) {
		super(message, 'PokemonUnknownError');
	}

	isRetryable(): boolean {
		return false;
	}
}
