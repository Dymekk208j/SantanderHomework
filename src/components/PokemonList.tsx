import * as React from 'react';
import type { PokemonForm } from '../types/pokemon';
import { toPokemonDisplay } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';
import { LoadingDots } from './LoadingDots';

interface PokemonListProps {
  readonly pokemons: readonly PokemonForm[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly hasQuery: boolean;
  readonly onRetry: () => void;
}

const MessageBox: React.FC<{
  readonly icon: string;
  readonly text: string;
  readonly variant: 'loading' | 'error' | 'empty';
  readonly extra?: React.ReactNode;
}> = ({ icon, text, variant, extra }) => {
  const variantStyles = {
    loading: 'bg-poke-surface border-white/[0.06] text-poke-secondary',
    error: 'bg-red-500/5 border-red-400/20 text-red-400',
    empty: 'bg-poke-surface border-white/[0.06] text-poke-muted',
  } as const;

  return (
    <div
      className={`text-center py-6 px-5 rounded-[14px] border ${variantStyles[variant]}`}
      role={variant === 'error' ? 'alert' : undefined}
      aria-live={variant !== 'error' ? 'polite' : undefined}
    >
      {extra}
      {icon && <span className="block text-2xl mb-2">{icon}</span>}
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

export const PokemonList: React.FC<PokemonListProps> = ({
  pokemons,
  isLoading,
  error,
  hasQuery,
  onRetry,
}) => {
  if (error) {
    return (
      <div
        className="text-center py-6 px-5 rounded-[14px] border bg-red-500/5 border-red-400/20"
        role="alert"
      >
        <span className="block text-2xl mb-2">⚠️</span>
        <span className="block text-sm font-medium text-red-400 mb-3">{error}</span>
        <button
          type="button"
          onClick={onRetry}
          className={
            "
            px-4 py-2 text-sm font-semibold rounded-lg
            bg-poke-red/20 text-poke-red border border-poke-red/30
            hover:bg-poke-red/30 active:scale-95
            transition-all duration-150
          "
          }
        >
          Try again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <MessageBox
        icon=""
        text="Searching the Pokédex…"
        variant="loading"
        extra={<LoadingDots />}
      />
    );
  }

  if (hasQuery && pokemons.length === 0) {
    return (
      <MessageBox icon="🤷" text="No Pokémon found. Try a different name!" variant="empty" />
    );
  }

  if (pokemons.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-[0.7rem] text-poke-muted font-semibold uppercase tracking-[1px] mb-2 pl-0.5">
        {pokemons.length} {pokemons.length === 1 ? 'result' : 'results'}
      </p>
      <ul className="flex flex-col gap-3" role="list" aria-label="Search results">
        {pokemons.map((pokemon, index) => (
          <PokemonCard key={pokemon.id} pokemon={toPokemonDisplay(pokemon)} index={index} />
        ))}
      </ul>
    </div>
  );
};