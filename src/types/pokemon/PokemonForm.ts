import { z } from 'zod';
import { PokemonSpritesSchema } from './PokemonSprites';

export const PokemonFormSchema = z.object({
	id: z.number().int().positive(),
	name: z.string().min(1),
	sprites: PokemonSpritesSchema,
});

export type PokemonForm = z.infer<typeof PokemonFormSchema>;
