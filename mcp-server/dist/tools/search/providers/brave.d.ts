/**
 * Brave Search Provider
 *
 * REQ-SRCH-001: 検索フォールバック機構
 * Uses Brave Search API v1
 * API Documentation: https://api.search.brave.com/app/documentation/web-search/get-started
 */
import type { SingleSearchProviderConfig } from '../../../config/types.js';
import { BaseSearchProvider, type SearchResult } from './types.js';
export declare class BraveSearchProvider extends BaseSearchProvider {
    readonly name = "brave";
    private apiKey;
    private rateLimitMs;
    private maxRetries;
    private lastRequestTime;
    constructor(config: SingleSearchProviderConfig);
    isAvailable(): Promise<boolean>;
    search(query: string, maxResults?: number): Promise<SearchResult[]>;
    private parseResults;
    private rateLimit;
    private exponentialBackoff;
}
//# sourceMappingURL=brave.d.ts.map