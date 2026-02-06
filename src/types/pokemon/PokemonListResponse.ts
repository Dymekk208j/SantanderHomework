import { z } from 'zod';
import { PokemonListItemSchema } from './PokemonListItem';

export const PokemonListResponseSchema = z.object({
	results: z.array(PokemonListItemSchema),
});

export type PokemonListResponse = z.infer<typeof PokemonListResponseSchema>;
