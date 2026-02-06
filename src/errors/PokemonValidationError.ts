import { PokemonError } from './PokemonError';

/** Error thrown when data validation fails */
export class PokemonValidationError extends PokemonError {
	constructor(
		message: string,
		public readonly validationErrors?: unknown
	) {
		super(message, 'PokemonValidationError');
	}

	isRetryable(): boolean {
		return false;
	}
}
