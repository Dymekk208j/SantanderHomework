import type { PokemonDisplay } from '@app-types/pokemon';

export interface PokemonCardProps {
	readonly pokemon: PokemonDisplay;
	readonly index: number;
}
