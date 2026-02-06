import { FALLBACK_IMAGE } from '@constants';
import type { PokemonForm, PokemonDisplay } from '@app-types';
import { createDisplayName } from '@app-types';

export function toPokemonDisplay(form: PokemonForm): PokemonDisplay {
	const displayName = createDisplayName(
		form.name
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ')
	);

	return {
		displayName,
		displayId: `#${String(form.id).padStart(4, '0')}`,
		imageUrl: form.sprites.front_default ?? FALLBACK_IMAGE,
	};
}
