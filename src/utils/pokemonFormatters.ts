import { FALLBACK_IMAGE } from '@constants';
import type { PokemonForm } from '@app-types/pokemon/PokemonForm';
import type { PokemonDisplay, DisplayName } from '@app-types/pokemon/PokemonDisplay';

export function toPokemonDisplay(form: PokemonForm): PokemonDisplay {
	const displayName = form.name
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ') as DisplayName;

	return {
		displayName,
		displayId: `#${String(form.id).padStart(4, '0')}`,
		imageUrl: form.sprites.front_default ?? FALLBACK_IMAGE,
	};
}
