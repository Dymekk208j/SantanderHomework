import type { PokemonDisplay } from './pokemon';

export interface PokemonCardProps {
	readonly pokemon: PokemonDisplay;
	readonly index: number;
}
