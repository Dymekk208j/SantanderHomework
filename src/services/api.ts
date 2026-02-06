import ky from 'ky';
import { MAX_RETRIES, RETRY_BASE_DELAY_MS, REQUEST_TIMEOUT_MS } from '@constants';

/**
 * Configured HTTP client for Pokemon API requests.
 * - Automatic retry on 5xx errors and network failures
 * - Exponential backoff delay
 * - Request timeout protection
 */
export const api = ky.create({
	timeout: REQUEST_TIMEOUT_MS,
	retry: {
		limit: MAX_RETRIES,
		methods: ['get'],
		statusCodes: [408, 413, 429, 500, 502, 503, 504],
		delay: (attemptCount) => RETRY_BASE_DELAY_MS * attemptCount,
	},
});
