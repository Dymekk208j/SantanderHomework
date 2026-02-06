import * as React from 'react';
import type { PokemonDisplay } from '../types/pokemon';

interface PokemonCardProps {
  readonly pokemon: PokemonDisplay;
  readonly index: number;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, index }) => {
  const delayClass = `card-delay-${index + 1}`;

  return (
    <li
      className={`
        group relative flex items-center gap-4 p-3 overflow-hidden
        bg-poke-card border border-white/[0.06] rounded-[14px] cursor-default
        transition-all duration-250
        hover:bg-poke-card-hover hover:border-white/10
        hover:-translate-y-[3px] hover:scale-[1.01]
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]
        animate-card-in ${delayClass}
        max-sm:p-2.5 max-sm:gap-3
      `}
    >
      <div
        className={
          "
          absolute inset-0 opacity-0 group-hover:opacity-100
          bg-gradient-to-r from-transparent via-white/[0.04] to-transparent
          pointer-events-none transition-opacity duration-250
        "
        }
      />

      <div
        className={
          "
          w-[72px] h-[72px] shrink-0 flex items-center justify-center
          bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)]
          rounded-lg
          max-sm:w-14 max-sm:h-14
        "
        }
      >
        <img
          className={
            "
            w-full h-full object-contain [image-rendering:pixelated]
            drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]
            transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            group-hover:scale-115 group-hover:-rotate-3
          "
          src={pokemon.imageUrl}
          alt={`Sprite of ${pokemon.displayName}`}
          loading="lazy"
          width={96}
          height={96}
        />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[1.05rem] font-bold text-white tracking-[0.2px] truncate max-sm:text-[0.95rem]">
          {pokemon.displayName}
        </span>
        <span className="text-[0.7rem] font-semibold text-poke-muted tabular-nums">
          {pokemon.displayId}
        </span>
      </div>
    </li>
  );
};