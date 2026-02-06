import { z } from 'zod';

export const PokemonTypeSchema = z.object({
	type: z.object({
		name: z.string(),
	}),
});

export type PokemonType = z.infer<typeof PokemonTypeSchema>;
