import { z } from 'zod';
import { PokemonSpritesSchema } from './PokemonSprites';
import { PokemonTypeSchema } from './PokemonType';

export const PokemonFormSchema = z.object({
	id: z.number().int().positive(),
	name: z.string().min(1),
	sprites: PokemonSpritesSchema,
	types: z.array(PokemonTypeSchema).optional(),
});

export type PokemonForm = z.infer<typeof PokemonFormSchema>;
