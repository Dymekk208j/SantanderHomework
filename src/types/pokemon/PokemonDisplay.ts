/** Branded type for pokemon names that have been formatted for display */
export type DisplayName = string & { readonly __brand: 'DisplayName' };

/** Display-friendly representation of Pokemon data */
export interface PokemonDisplay {
	readonly displayName: DisplayName;
	readonly displayId: string;
	readonly imageUrl: string;
}
