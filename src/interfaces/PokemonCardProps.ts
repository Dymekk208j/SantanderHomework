import type { PokemonDisplay } from '../types/pokemon';

export interface PokemonCardProps {
	readonly pokemon: PokemonDisplay;
	readonly index: number;
}
