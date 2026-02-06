import { PokemonError } from './PokemonError';

/** Error thrown when the API returns a non-OK status */
export class PokemonApiError extends PokemonError {
	constructor(
		message: string,
		public readonly status: number
	) {
		super(message, 'PokemonApiError');
	}

	isRetryable(): boolean {
		return this.status >= 500;
	}
}
