import ky from 'ky';
import { REQUEST_TIMEOUT_MS } from '@constants';

/**
 * Configured HTTP client for Pokemon API requests.
 * - Request timeout protection
 * - Retry logic is handled at the React Query level in usePokemonSearch hook
 */
export const api = ky.create({
	timeout: REQUEST_TIMEOUT_MS,
	retry: 0, // Retry handled by React Query with error classification
});
