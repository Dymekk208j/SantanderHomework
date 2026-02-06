/** Base error class for all Pokemon-related errors */
export abstract class PokemonError extends Error {
	constructor(message: string) {
		super(message);
		this.name = new.target.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}

	/** Returns true if this error should trigger a retry */
	abstract isRetryable(): boolean;
}
