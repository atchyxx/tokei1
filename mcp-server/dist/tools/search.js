/**
 * Search Tool with Fallback Mechanism
 *
 * Implements REQ-DR-002: Web検索
 * Implements REQ-ERR-001: Web検索失敗時のリトライ（最大3回、指数バックオフ）
 * Implements REQ-NF-007: プロバイダー設定ファイル対応
 * Implements REQ-SRCH-001: 検索フォールバック機構 (v1.5.0)
 * Implements REQ-SRCH-002: 複数検索プロバイダー対応 (v1.5.0)
 * Implements REQ-WF-002: 検索結果品質検証 (v1.5.0)
 * Implements REQ-SRCH-003: 検索失敗時の自動リカバリー (v1.7.0)
 * Implements REQ-ACAD-001: 学術クエリ変換 (v1.14.0)
 */
import * as cheerio from 'cheerio';
import { getConfig } from '../config/loader.js';
import { isSearchConfig, isLegacySearchConfig, DEFAULT_SEARCH_RECOVERY_CONFIG } from '../config/types.js';
import { SearchProviderManager, convertLegacySearchConfig } from './search/provider-manager.js';
import { FallbackHandler } from './search/fallback-handler.js';
import { HealthChecker } from './search/health-checker.js';
import { SearchRecoveryManager } from './search/recovery/index.js';
// v1.14.0: 学術検索アダプター
import { AcademicSearchAdapter, isAcademicQuery } from './search/academic/index.js';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
// Rate limiting (will be initialized from config)
let lastRequestTime = 0;
// v1.5.0: Singleton instances
let providerManager = null;
let fallbackHandler = null;
let healthChecker = null;
// v1.7.0: Search recovery manager
let recoveryManager = null;
// v1.14.0: Academic search adapter
let academicAdapter = null;
/**
 * v1.14.0: Get or initialize academic adapter
 */
function getAcademicAdapter() {
    if (!academicAdapter) {
        academicAdapter = new AcademicSearchAdapter();
    }
    return academicAdapter;
}
/**
 * Initialize v1.5.0 search infrastructure
 */
function initializeSearchInfrastructure() {
    const config = getConfig();
    let searchConfig;
    // Handle both v1.4.0 (legacy) and v1.5.0 (new) config formats
    if (config.search && isSearchConfig(config.search)) {
        searchConfig = config.search;
    }
    else if (config.search && isLegacySearchConfig(config.search)) {
        searchConfig = convertLegacySearchConfig(config.search);
        console.error('[SHIKIGAMI] Using legacy search config format. Please update to v1.5.0 format.');
    }
    else {
        // Default config
        searchConfig = {
            providers: [
                { name: 'duckduckgo', enabled: true, priority: 1 },
            ],
            fallback: {
                enabled: false,
                maxRetries: 3,
                retryDelayMs: 2000,
            },
            options: {
                rateLimitMs: 1500,
                locale: 'ja,en-US;q=0.9,en;q=0.8',
            },
        };
    }
    // Ensure fallback config exists
    const fallbackConfig = searchConfig.fallback ?? {
        enabled: false,
        maxRetries: 3,
        retryDelayMs: 2000,
    };
    providerManager = new SearchProviderManager(searchConfig);
    fallbackHandler = new FallbackHandler(providerManager, fallbackConfig);
    healthChecker = new HealthChecker(providerManager);
    // v1.7.0: Initialize recovery manager
    const recoveryConfig = config.searchRecovery ?? DEFAULT_SEARCH_RECOVERY_CONFIG;
    if (recoveryConfig.enabled) {
        recoveryManager = new SearchRecoveryManager(recoveryConfig);
    }
}
/**
 * Get or initialize provider manager
 */
function getProviderManager() {
    if (!providerManager) {
        initializeSearchInfrastructure();
    }
    return providerManager;
}
/**
 * Get or initialize fallback handler
 */
function getFallbackHandler() {
    if (!fallbackHandler) {
        initializeSearchInfrastructure();
    }
    return fallbackHandler;
}
/**
 * Get or initialize health checker
 */
function getHealthChecker() {
    if (!healthChecker) {
        initializeSearchInfrastructure();
    }
    return healthChecker;
}
/**
 * v1.7.0: Get or initialize recovery manager
 */
function getRecoveryManager() {
    if (!recoveryManager && !providerManager) {
        initializeSearchInfrastructure();
    }
    return recoveryManager;
}
/**
 * Get rate limit interval from config
 */
function getMinRequestInterval() {
    const config = getConfig();
    if (config.search && isSearchConfig(config.search)) {
        return config.search.options?.rateLimitMs ?? 1500;
    }
    else if (config.search && isLegacySearchConfig(config.search)) {
        return config.search.options?.rateLimitMs ?? 1500;
    }
    return 1500;
}
/**
 * Get max retries from config
 */
function getMaxRetries() {
    const config = getConfig();
    if (config.search && isSearchConfig(config.search)) {
        // v1.5.0: use fallback.maxRetries
        return config.search.fallback?.maxRetries ?? 3;
    }
    else if (config.search && isLegacySearchConfig(config.search)) {
        // v1.4.0: use options.maxRetries
        return config.search.options?.maxRetries ?? 3;
    }
    return 3;
}
/**
 * Get base backoff from config (default 2000ms)
 */
function getBaseBackoff() {
    return 2000;
}
async function rateLimit() {
    const now = Date.now();
    const minInterval = getMinRequestInterval();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < minInterval) {
        await new Promise((resolve) => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();
}
/**
 * Sleep for exponential backoff
 */
async function exponentialBackoff(attempt) {
    const baseBackoff = getBaseBackoff();
    const maxRetries = getMaxRetries();
    const delay = baseBackoff * Math.pow(2, attempt);
    console.error(`[SHIKIGAMI] Retry ${attempt + 1}/${maxRetries} - waiting ${delay}ms`);
    await new Promise((resolve) => setTimeout(resolve, delay));
}
/**
 * v1.5.0: Search with fallback mechanism (REQ-SRCH-001)
 *
 * Uses configured providers in priority order with automatic fallback.
 */
export async function searchWithFallback(query, maxResults = 10) {
    const handler = getFallbackHandler();
    return handler.searchWithFallback(query, maxResults);
}
/**
 * v1.7.0: Search with auto-recovery (REQ-SRCH-003)
 * v1.14.0: 学術クエリの自動変換 (REQ-ACAD-001)
 *
 * When search returns 0 results, automatically attempts recovery strategies:
 * 1. Synonym replacement (レアアース → 希土類)
 * 2. Query simplification (remove years, stopwords)
 * 3. Language translation (日本語 → English)
 * 4. Direct visit (Level 3 recovery) (v1.14.0)
 */
export async function searchWithRecovery(query, maxResults = 10) {
    const handler = getFallbackHandler();
    const recovery = getRecoveryManager();
    const adapter = getAcademicAdapter();
    // v1.14.0: 学術クエリの検出と変換
    let effectiveQuery = query;
    let isAcademic = false;
    let academicSources;
    if (isAcademicQuery(query)) {
        isAcademic = true;
        const conversion = adapter.formatQuery(query);
        effectiveQuery = conversion.convertedQuery;
        academicSources = conversion.sourceUrls;
        console.error(`[SHIKIGAMI] Academic query detected, enhanced: "${effectiveQuery}"`);
    }
    // First, try normal search
    const initialResult = await handler.searchWithFallback(effectiveQuery, maxResults);
    // If we have results or recovery is disabled, return as-is
    if (initialResult.results.length > 0 || !recovery) {
        return {
            results: initialResult.results,
            originalQuery: query,
            academicEnhanced: isAcademic,
            academicSources: isAcademic ? academicSources : undefined,
        };
    }
    // No results - attempt recovery
    console.error(`[SHIKIGAMI] No results for "${effectiveQuery}", attempting recovery...`);
    const recoveryResult = await recovery.recover(query, async (altQuery) => {
        const altResult = await handler.searchWithFallback(altQuery, maxResults);
        return altResult.results;
    });
    if (recoveryResult.success && recoveryResult.results) {
        console.error(`[SHIKIGAMI] Recovery successful with query: "${recoveryResult.usedQuery?.query}"`);
        return {
            results: recoveryResult.results,
            recovery: recoveryResult,
            originalQuery: query,
        };
    }
    // Recovery also failed
    console.error(`[SHIKIGAMI] Recovery failed for "${query}" after ${recoveryResult.totalRetries} attempts`);
    return {
        results: [],
        recovery: recoveryResult,
        originalQuery: query,
    };
}
/**
 * v1.5.0: Check health of all search providers (REQ-WF-002)
 */
export async function checkSearchHealth() {
    const checker = getHealthChecker();
    return checker.checkAllProviders();
}
/**
 * v1.5.0: Validate search results quality (REQ-WF-002)
 */
export function validateSearchResults(results, query) {
    const checker = getHealthChecker();
    return checker.validateResults(results, query);
}
/**
 * Search DuckDuckGo with retry logic (REQ-ERR-001)
 *
 * @deprecated Use searchWithFallback() for v1.5.0 fallback support.
 * This function is kept for backward compatibility.
 */
export async function searchDuckDuckGo(query, maxResults = 10) {
    const config = getConfig();
    const maxRetries = getMaxRetries();
    const locale = config.search?.options?.locale ?? 'ja,en-US;q=0.9,en;q=0.8';
    let lastError = null;
    let lastStatusCode;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            await rateLimit();
            const encodedQuery = encodeURIComponent(query);
            const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': USER_AGENT,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': locale,
                },
            });
            lastStatusCode = response.status;
            // Handle rate limiting (429) with exponential backoff
            if (response.status === 429) {
                console.error(`[SHIKIGAMI] Rate limited (429) for query: "${query}"`);
                if (attempt < maxRetries - 1) {
                    await exponentialBackoff(attempt);
                    continue;
                }
                throw new Error(`Rate limited after ${maxRetries} retries`);
            }
            if (!response.ok) {
                throw new Error(`DuckDuckGo search failed: ${response.status}`);
            }
            const html = await response.text();
            const $ = cheerio.load(html);
            const results = [];
            // Parse search results
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
            // Success - log and return
            if (attempt > 0) {
                console.error(`[SHIKIGAMI] Search succeeded after ${attempt + 1} attempts`);
            }
            return results;
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.error(`[SHIKIGAMI] Search attempt ${attempt + 1} failed: ${lastError.message}`);
            // Retry on network errors
            if (attempt < maxRetries - 1) {
                await exponentialBackoff(attempt);
            }
        }
    }
    // All retries exhausted - log and throw
    console.error(`[SHIKIGAMI] Search failed after ${maxRetries} retries for query: "${query}"`);
    throw new Error(`Search failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}` +
        (lastStatusCode ? ` (last status: ${lastStatusCode})` : ''));
}
/**
 * Reset search infrastructure (for testing)
 * @internal
 */
export function resetSearchInfrastructure() {
    providerManager = null;
    fallbackHandler = null;
    healthChecker = null;
    recoveryManager = null;
}
import { DEFAULT_MULTILINGUAL_SEARCH_CONFIG } from '../config/types.js';
import { BUILTIN_DICTIONARY } from './search/recovery/strategies/translate.js';
/**
 * v1.8.0追加の翻訳辞書（自動車・素材業界用語）
 */
const MULTILINGUAL_DICTIONARY_V180 = {
    // 自動車業界
    'ネオジム磁石': 'neodymium magnet',
    '永久磁石': 'permanent magnet',
    '重希土類': 'heavy rare earth',
    'ジスプロシウム': 'dysprosium',
    'テルビウム': 'terbium',
    '磁石レスモーター': 'magnet-free motor',
    '巻線界磁モーター': 'wound field motor',
    // 企業名
    'プロテリアル': 'Proterial',
    '大同特殊鋼': 'Daido Steel',
    '信越化学': 'Shin-Etsu Chemical',
    'TDK': 'TDK',
    // ビジネス用語
    '脱中国依存': 'reducing China dependency',
    '代替材料': 'alternative materials',
    '調達': 'procurement',
    '戦略': 'strategy',
};
/**
 * 言語検出 (TSK-002)
 * REQ-SRCH-004-01: 言語検出
 */
export function detectLanguage(query) {
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    const hasJapanese = japanesePattern.test(query);
    const hasAscii = /[a-zA-Z]/.test(query);
    if (hasJapanese && hasAscii)
        return 'mixed';
    if (hasJapanese)
        return 'ja';
    return 'en';
}
/**
 * クエリ翻訳 (TSK-003)
 * REQ-SRCH-004-02: クエリ翻訳
 * v1.7.0のBUILTIN_DICTIONARYを拡張して使用
 */
export function translateQuery(query, customDictionary) {
    // v1.7.0辞書 + v1.8.0追加辞書 + カスタム辞書をマージ
    const dictionary = {
        ...BUILTIN_DICTIONARY,
        ...MULTILINGUAL_DICTIONARY_V180,
        ...customDictionary,
    };
    let translated = query;
    for (const [ja, en] of Object.entries(dictionary)) {
        translated = translated.replace(new RegExp(ja, 'g'), en);
    }
    // 変換があった場合のみ返却
    return translated !== query ? translated : null;
}
/**
 * URL正規化 (TSK-004)
 * REQ-SRCH-004-04: 結果マージと重複排除
 */
export function normalizeUrl(url) {
    try {
        const u = new URL(url);
        // 末尾スラッシュ削除
        u.pathname = u.pathname.replace(/\/$/, '');
        // クエリパラメータソート
        u.searchParams.sort();
        // トラッキングパラメータ削除
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'fbclid', 'gclid'].forEach(p => {
            u.searchParams.delete(p);
        });
        // フラグメント削除
        u.hash = '';
        return u.toString().toLowerCase();
    }
    catch {
        return url.toLowerCase();
    }
}
/**
 * 結果マージ・重複排除 (TSK-004)
 * REQ-SRCH-004-04: 結果マージと重複排除
 */
function mergeAndDeduplicate(jaResults, enResults, priorityLang) {
    const seen = new Map();
    // 優先言語の結果を先に処理
    const first = priorityLang === 'ja' ? jaResults : enResults;
    const firstLang = priorityLang;
    const second = priorityLang === 'ja' ? enResults : jaResults;
    const secondLang = priorityLang === 'ja' ? 'en' : 'ja';
    for (const r of first) {
        const normalized = normalizeUrl(r.url);
        if (!seen.has(normalized)) {
            seen.set(normalized, { ...r, sourceLanguage: firstLang });
        }
    }
    for (const r of second) {
        const normalized = normalizeUrl(r.url);
        if (!seen.has(normalized)) {
            seen.set(normalized, { ...r, sourceLanguage: secondLang });
        }
    }
    return Array.from(seen.values());
}
/**
 * 多言語並列検索 (TSK-005)
 * REQ-SRCH-004-03: 並列検索実行
 *
 * 設定で`multilingualSearch.enabled: true`の場合に使用
 */
export async function searchMultilingual(query, config) {
    const startTime = Date.now();
    // 設定をマージ
    const mergedConfig = {
        ...DEFAULT_MULTILINGUAL_SEARCH_CONFIG,
        ...config,
    };
    const detectedLang = detectLanguage(query);
    const translatedQuery = detectedLang === 'ja' || detectedLang === 'mixed'
        ? translateQuery(query, mergedConfig.customDictionary)
        : null;
    // 並列検索実行
    const [jaResultsSettled, enResultsSettled] = await Promise.allSettled([
        searchDuckDuckGo(query, mergedConfig.maxResults),
        translatedQuery
            ? searchDuckDuckGo(translatedQuery, mergedConfig.maxResults)
            : Promise.resolve([]),
    ]);
    const jaResults = jaResultsSettled.status === 'fulfilled' ? jaResultsSettled.value : [];
    const enResults = enResultsSettled.status === 'fulfilled' ? enResultsSettled.value : [];
    // 結果マージ・重複排除
    const merged = mergeAndDeduplicate(jaResults, enResults, mergedConfig.priorityLanguage);
    const executionTimeMs = Date.now() - startTime;
    const duplicatesRemoved = (jaResults.length + enResults.length) - merged.length;
    return {
        query: {
            original: query,
            translated: translatedQuery,
            detectedLanguage: detectedLang,
        },
        results: merged,
        metadata: {
            totalResults: merged.length,
            japaneseResults: jaResults.length,
            englishResults: enResults.length,
            duplicatesRemoved,
            executionTimeMs,
        },
    };
}
// v1.15.0: Search enhancer exports (REQ-DICT-001, REQ-PAT-001)
export { enhanceSearchQuery, getPatentSearchUrls, canEnhanceQuery, } from './search/v115-search-enhancer.js';
//# sourceMappingURL=search.js.map