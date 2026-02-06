import * as React from 'react';

export const Pokeball: React.FC = () => (
	<div
		className="relative h-9 w-9 shrink-0 animate-pokeball-float rounded-full border-[3px] border-white bg-gradient-to-b from-poke-red from-45% via-poke-bg via-50% to-white to-55%"
		aria-hidden="true"
	>
		<span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-poke-bg" />
	</div>
);
