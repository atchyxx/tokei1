/**
 * SearXNG Search Provider
 *
 * REQ-SRCH-001: 検索フォールバック機構
 * Uses SearXNG JSON API (self-hosted metasearch engine)
 * Documentation: https://docs.searxng.org/dev/search_api.html
 */
import { BaseSearchProvider } from './types.js';
const DEFAULT_ENDPOINT = 'http://localhost:8080';
export class SearXNGProvider extends BaseSearchProvider {
    name = 'searxng';
    endpoint;
    rateLimitMs;
    maxRetries;
    timeout;
    lastRequestTime = 0;
    _isAvailable = null;
    constructor(config) {
        super(config);
        this.endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
        this.rateLimitMs = config.options?.rateLimitMs ?? 500;
        this.maxRetries = config.options?.maxRetries ?? 2;
        this.timeout = config.options?.timeout ?? 10000;
    }
    async isAvailable() {
        // キャッシュされた結果があればそれを返す（5分間有効）
        if (this._isAvailable !== null) {
            return this._isAvailable;
        }
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${this.endpoint}/config`, {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            this._isAvailable = response.ok;
            // 5分後にキャッシュを無効化
            setTimeout(() => {
                this._isAvailable = null;
            }, 5 * 60 * 1000);
            return this._isAvailable;
        }
        catch {
            this._isAvailable = false;
            return false;
        }
    }
    async search(query, maxResults = 10) {
        let lastError = null;
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                await this.rateLimit();
                const params = new URLSearchParams({
                    q: query,
                    format: 'json',
                    language: 'ja',
                });
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                const response = await fetch(`${this.endpoint}/search?${params}`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error(`SearXNG search failed: ${response.status}`);
                }
                const data = (await response.json());
                const results = this.parseResults(data, maxResults);
                if (attempt > 0) {
                    console.error(`[SHIKIGAMI] SearXNG search succeeded after ${attempt + 1} attempts`);
                }
                this.recordSuccess();
                this._isAvailable = true;
                return results;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                // タイムアウトの場合
                if (lastError.name === 'AbortError') {
                    lastError = new Error('SearXNG request timed out');
                }
                console.error(`[SHIKIGAMI] SearXNG attempt ${attempt + 1} failed: ${lastError.message}`);
                if (attempt < this.maxRetries - 1) {
                    await this.exponentialBackoff(attempt);
                }
            }
        }
        this.recordError();
        this._isAvailable = false;
        throw new Error(`SearXNG search failed after ${this.maxRetries} retries: ${lastError?.message || 'Unknown error'}`);
    }
    parseResults(data, maxResults) {
        const results = [];
        const searchResults = data.results ?? [];
        for (const item of searchResults) {
            if (results.length >= maxResults)
                break;
            results.push({
                title: item.title,
                url: item.url,
                snippet: item.content ?? '',
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
        console.error(`[SHIKIGAMI] SearXNG retry ${attempt + 1}/${this.maxRetries} - waiting ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
}
//# sourceMappingURL=searxng.js.map