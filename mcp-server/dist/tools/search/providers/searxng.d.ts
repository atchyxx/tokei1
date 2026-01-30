/**
 * SearXNG Search Provider
 *
 * REQ-SRCH-001: 検索フォールバック機構
 * Uses SearXNG JSON API (self-hosted metasearch engine)
 * Documentation: https://docs.searxng.org/dev/search_api.html
 */
import type { SingleSearchProviderConfig } from '../../../config/types.js';
import { BaseSearchProvider, type SearchResult } from './types.js';
export declare class SearXNGProvider extends BaseSearchProvider {
    readonly name = "searxng";
    private endpoint;
    private rateLimitMs;
    private maxRetries;
    private timeout;
    private lastRequestTime;
    private _isAvailable;
    constructor(config: SingleSearchProviderConfig);
    isAvailable(): Promise<boolean>;
    search(query: string, maxResults?: number): Promise<SearchResult[]>;
    private parseResults;
    private rateLimit;
    private exponentialBackoff;
}
//# sourceMappingURL=searxng.d.ts.map