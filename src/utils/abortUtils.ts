import { PokemonAbortError } from '@errors';

export function delayWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
	if (signal?.aborted) {
		return Promise.reject(new PokemonAbortError());
	}

	return new Promise<void>((resolve, reject) => {
		const timer = setTimeout(resolve, ms);
		signal?.addEventListener(
			'abort',
			() => {
				clearTimeout(timer);
				reject(new PokemonAbortError());
			},
			{ once: true }
		);
	});
}
