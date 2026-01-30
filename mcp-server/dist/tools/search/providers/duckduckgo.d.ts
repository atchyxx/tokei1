/**
 * DuckDuckGo Search Provider
 *
 * REQ-SRCH-001: 検索フォールバック機構
 * Uses DuckDuckGo HTML search (no API key required)
 */
import type { SingleSearchProviderConfig } from '../../../config/types.js';
import { BaseSearchProvider, type SearchResult } from './types.js';
export declare class DuckDuckGoProvider extends BaseSearchProvider {
    readonly name = "duckduckgo";
    private lastRequestTime;
    private rateLimitMs;
    private maxRetries;
    private locale;
    constructor(config: SingleSearchProviderConfig);
    isAvailable(): Promise<boolean>;
    search(query: string, maxResults?: number): Promise<SearchResult[]>;
    private parseResults;
    private rateLimit;
    private exponentialBackoff;
}
//# sourceMappingURL=duckduckgo.d.ts.map