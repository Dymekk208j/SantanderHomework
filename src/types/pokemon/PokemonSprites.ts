import { z } from 'zod';

export const PokemonSpritesSchema = z.object({
	front_default: z.string().url().nullable(),
});

export type PokemonSprites = z.infer<typeof PokemonSpritesSchema>;
