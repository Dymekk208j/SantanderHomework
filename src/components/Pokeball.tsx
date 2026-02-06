import * as React from 'react';

export const Pokeball: React.FC = () => (
  <div
    className={
      "
      relative w-9 h-9 shrink-0 rounded-full border-[3px] border-white
      animate-pokeball-float
      bg-gradient-to-b from-poke-red from-45% via-poke-bg via-45% via-55% to-white to-55%
    "
    }
    aria-hidden="true"
  >
    <span
      className={
        "
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-3 h-3 rounded-full bg-poke-bg border-[3px] border-white
      "
      }
    />
  </div>
);