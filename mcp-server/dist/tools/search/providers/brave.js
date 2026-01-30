/**
 * Brave Search Provider
 *
 * REQ-SRCH-001: 検索フォールバック機構
 * Uses Brave Search API v1
 * API Documentation: https://api.search.brave.com/app/documentation/web-search/get-started
 */
import { BaseSearchProvider } from './types.js';
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';
export class BraveSearchProvider extends BaseSearchProvider {
    name = 'brave';
    apiKey;
    rateLimitMs;
    maxRetries;
    lastRequestTime = 0;
    constructor(config) {
        super(config);
        // API key は設定または環境変数から取得
        this.apiKey = config.apiKey ?? process.env.BRAVE_API_KEY ?? '';
        this.rateLimitMs = config.options?.rateLimitMs ?? 1000;
        this.maxRetries = config.options?.maxRetries ?? 2;
    }
    async isAvailable() {
        // API key が設定されていれば利用可能
        return !!this.apiKey;
    }
    async search(query, maxResults = 10) {
        if (!this.apiKey) {
            throw new Error('Brave Search API key is not configured');
        }
        let lastError = null;
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                await this.rateLimit();
                const params = new URLSearchParams({
                    q: query,
                    count: Math.min(maxResults, 20).toString(), // Brave API max is 20
                });
                const response = await fetch(`${BRAVE_API_URL}?${params}`, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Subscription-Token': this.apiKey,
                    },
                });
                if (response.status === 401) {
                    throw new Error('Invalid Brave Search API key');
                }
                if (response.status === 429) {
                    console.error(`[SHIKIGAMI] Brave Search rate limited (429)`);
                    if (attempt < this.maxRetries - 1) {
                        await this.exponentialBackoff(attempt);
                        continue;
                    }
                    throw new Error('Brave Search rate limited');
                }
                if (!response.ok) {
                    throw new Error(`Brave Search failed: ${response.status}`);
                }
                const data = (await response.json());
                const results = this.parseResults(data, maxResults);
                if (attempt > 0) {
                    console.error(`[SHIKIGAMI] Brave Search succeeded after ${attempt + 1} attempts`);
                }
                this.recordSuccess();
                return results;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.error(`[SHIKIGAMI] Brave Search attempt ${attempt + 1} failed: ${lastError.message}`);
                if (attempt < this.maxRetries - 1) {
                    await this.exponentialBackoff(attempt);
                }
            }
        }
        this.recordError();
        throw new Error(`Brave Search failed after ${this.maxRetries} retries: ${lastError?.message || 'Unknown error'}`);
    }
    parseResults(data, maxResults) {
        const results = [];
        const webResults = data.web?.results ?? [];
        for (const item of webResults) {
            if (results.length >= maxResults)
                break;
            results.push({
                title: item.title,
                url: item.url,
                snippet: item.description,
            });
        }
        return results;
    }
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimitMs) {
            await new Promise((resolve) => setTimeout(resolve, this.rateLimitMs - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();
    }
    async exponentialBackoff(attempt) {
        const baseBackoff = 1000;
        const delay = baseBackoff * Math.pow(2, attempt);
        console.error(`[SHIKIGAMI] Brave Search retry ${attempt + 1}/${this.maxRetries} - waiting ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
}
//# sourceMappingURL=brave.js.map