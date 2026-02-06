import type { FC } from 'react';

export const LoadingDots: FC = () => (
	<div className="inline-flex items-center justify-center gap-2 py-2" aria-hidden="true">
		<span className="h-2 w-2 animate-dot-bounce rounded-full bg-poke-red" />
		<span className="h-2 w-2 animate-dot-bounce rounded-full bg-poke-red [animation-delay:150ms]" />
		<span className="h-2 w-2 animate-dot-bounce rounded-full bg-poke-red [animation-delay:300ms]" />
	</div>
);
