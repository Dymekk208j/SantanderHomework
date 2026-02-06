import { z } from 'zod';

export const PokemonListItemSchema = z.object({
	name: z.string(),
	url: z.string().url(),
});

export type PokemonListItem = z.infer<typeof PokemonListItemSchema>;
