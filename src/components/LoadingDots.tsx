import * as React from 'react';

export const LoadingDots: React.FC = () => (
  <div className="inline-flex gap-2 items-center justify-center py-2" aria-hidden="true">
    <span className="w-2 h-2 rounded-full bg-poke-red animate-dot-bounce" />
    <span className="w-2 h-2 rounded-full bg-poke-red animate-dot-bounce [animation-delay:150ms]" />
    <span className="w-2 h-2 rounded-full bg-poke-red animate-dot-bounce [animation-delay:300ms]" />
  </div>
);