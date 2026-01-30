/**
 * DuckDuckGo Search Provider
 *
 * REQ-SRCH-001: 検索フォールバック機構
 * Uses DuckDuckGo HTML search (no API key required)
 */
import * as cheerio from 'cheerio';
import { BaseSearchProvider } from './types.js';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const DEFAULT_LOCALE = 'ja,en-US;q=0.9,en;q=0.8';
export class DuckDuckGoProvider extends BaseSearchProvider {
    name = 'duckduckgo';
    lastRequestTime = 0;
    rateLimitMs;
    maxRetries;
    locale;
    constructor(config) {
        super(config);
        this.rateLimitMs = config.options?.rateLimitMs ?? 1500;
        this.maxRetries = config.options?.maxRetries ?? 2;
        this.locale = DEFAULT_LOCALE;
    }
    async isAvailable() {
        // DuckDuckGo は常に利用可能（API key 不要）
        return true;
    }
    async search(query, maxResults = 10) {
        let lastError = null;
        let lastStatusCode;
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                await this.rateLimit();
                const encodedQuery = encodeURIComponent(query);
                const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': USER_AGENT,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': this.locale,
                    },
                });
                lastStatusCode = response.status;
                // Handle rate limiting (429) with exponential backoff
                if (response.status === 429) {
                    console.error(`[SHIKIGAMI] DuckDuckGo rate limited (429) for query: "${query}"`);
                    if (attempt < this.maxRetries - 1) {
                        await this.exponentialBackoff(attempt);
                        continue;
                    }
                    throw new Error(`Rate limited after ${this.maxRetries} retries`);
                }
                if (!response.ok) {
                    throw new Error(`DuckDuckGo search failed: ${response.status}`);
                }
                const html = await response.text();
                const results = this.parseResults(html, maxResults);
                // Success
                if (attempt > 0) {
                    console.error(`[SHIKIGAMI] DuckDuckGo search succeeded after ${attempt + 1} attempts`);
                }
                this.recordSuccess();
                return results;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.error(`[SHIKIGAMI] DuckDuckGo attempt ${attempt + 1} failed: ${lastError.message}`);
                if (attempt < this.maxRetries - 1) {
                    await this.exponentialBackoff(attempt);
                }
            }
        }
        // All retries exhausted
        this.recordError();
        throw new Error(`DuckDuckGo search failed after ${this.maxRetries} retries: ${lastError?.message || 'Unknown error'}` +
            (lastStatusCode ? ` (last status: ${lastStatusCode})` : ''));
    }
    parseResults(html, maxResults) {
        const $ = cheerio.load(html);
        const results = [];
        $('.result').each((index, element) => {
            if (index >= maxResults)
                return false;
            const $el = $(element);
            const titleEl = $el.find('.result__title a');
            const snippetEl = $el.find('.result__snippet');
            const title = titleEl.text().trim();
            let resultUrl = titleEl.attr('href') || '';
            const snippet = snippetEl.text().trim();
            // DuckDuckGo uses redirect URLs, extract the actual URL
            if (resultUrl.includes('uddg=')) {
                const match = resultUrl.match(/uddg=([^&]+)/);
                if (match) {
                    resultUrl = decodeURIComponent(match[1]);
                }
            }
            if (title && resultUrl) {
                results.push({
                    title,
                    url: resultUrl,
                    snippet,
                });
            }
        });
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
        const baseBackoff = 2000;
        const delay = baseBackoff * Math.pow(2, attempt);
        console.error(`[SHIKIGAMI] DuckDuckGo retry ${attempt + 1}/${this.maxRetries} - waiting ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
}
//# sourceMappingURL=duckduckgo.js.map