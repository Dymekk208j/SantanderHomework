import { z } from 'zod';

export const PokemonSpritesSchema = z.object({
	front_default: z.string().url().nullable(),
	other: z
		.object({
			'official-artwork': z.object({
				front_default: z.string().url().nullable(),
			}),
		})
		.optional(),
});

export type PokemonSprites = z.infer<typeof PokemonSpritesSchema>;
