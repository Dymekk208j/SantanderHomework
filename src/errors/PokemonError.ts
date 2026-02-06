/** Base error class for all Pokemon-related errors */
export abstract class PokemonError extends Error {
	constructor(message: string, name: string) {
		super(message);
		this.name = name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
