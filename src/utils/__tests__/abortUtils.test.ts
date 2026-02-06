import { delayWithAbort } from '@utils/abortUtils';
import { PokemonAbortError } from '@errors';
import { vi } from 'vitest';

describe('delayWithAbort', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should resolve after specified delay', async () => {
		const promise = delayWithAbort(1000);

		vi.advanceTimersByTime(1000);

		await expect(promise).resolves.toBeUndefined();
	});

	it('should reject with PokemonAbortError when signal is aborted', async () => {
		const controller = new AbortController();
		const promise = delayWithAbort(1000, controller.signal);

		controller.abort();

		await expect(promise).rejects.toThrow(PokemonAbortError);
	});

	it('should reject with PokemonAbortError when signal is aborted mid-delay', async () => {
		const controller = new AbortController();
		const promise = delayWithAbort(1000, controller.signal);

		vi.advanceTimersByTime(500);
		controller.abort();

		await expect(promise).rejects.toThrow(PokemonAbortError);
	});

	it('should not resolve if aborted before timer completes', async () => {
		const controller = new AbortController();
		const promise = delayWithAbort(1000, controller.signal);

		vi.advanceTimersByTime(999);
		controller.abort();

		await expect(promise).rejects.toThrow(PokemonAbortError);
	});

	it('should work without abort signal', async () => {
		const promise = delayWithAbort(500);

		vi.advanceTimersByTime(500);

		await expect(promise).resolves.toBeUndefined();
	});
});
