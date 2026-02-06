import { z } from 'zod';

// ══════════════════════════════════════
// Schemas — single source of truth
// ══════════════════════════════════════

export const PokemonListItemSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const PokemonListResponseSchema = z.object({
  results: z.array(PokemonListItemSchema),
});

export const PokemonSpritesSchema = z.object({
  front_default: z.string().url().nullable(),
});

export const PokemonFormSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  sprites: PokemonSpritesSchema,
});

// ══════════════════════════════════════
// Inferred types
// ══════════════════════════════════════

export type PokemonListItem = z.infer<typeof PokemonListItemSchema>;
export type PokemonListResponse = z.infer<typeof PokemonListResponseSchema>;
export type PokemonSprites = z.infer<typeof PokemonSpritesSchema>;
export type PokemonForm = z.infer<typeof PokemonFormSchema>;

// ══════════════════════════════════════
// Display utilities
// ══════════════════════════════════════

/** Branded type for pokemon names that have been formatted for display */
type DisplayName = string & { readonly __brand: 'DisplayName' };

// Mapped type + Capitalize — teraz już wiem jak to działa 😎
type PokemonDisplayFields = {
  [K in keyof PokemonForm as `display${Capitalize<string & K>}`]: K extends 'name'
    ? DisplayName
    : K extends 'id'
      ? string
      : PokemonForm[K];
};

export type PokemonDisplay = Pick<PokemonDisplayFields, 'displayName' | 'displayId'> & {
  readonly imageUrl: string;
};

const FALLBACK_IMAGE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

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
