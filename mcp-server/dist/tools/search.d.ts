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
import type { SearchWithFallbackResult, SearchHealthCheckResult } from './search/providers/types.js';
import type { RecoveryResult } from './search/recovery/types.js';
export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}
export interface SearchError {
    query: string;
    error: string;
    retries: number;
    lastStatusCode?: number;
}
export interface SearchResultWithMeta extends SearchResult {
    provider?: string;
    fallbackUsed?: boolean;
    quality?: number;
}
/**
 * v1.5.0: Search with fallback mechanism (REQ-SRCH-001)
 *
 * Uses configured providers in priority order with automatic fallback.
 */
export declare function searchWithFallback(query: string, maxResults?: number): Promise<SearchWithFallbackResult>;
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
export declare function searchWithRecovery(query: string, maxResults?: number): Promise<{
    results: SearchResult[];
    recovery?: RecoveryResult;
    originalQuery: string;
    academicEnhanced?: boolean;
    academicSources?: {
        pubmed?: string;
        googleScholar?: string;
        semanticScholar?: string;
    };
}>;
/**
 * v1.5.0: Check health of all search providers (REQ-WF-002)
 */
export declare function checkSearchHealth(): Promise<SearchHealthCheckResult>;
/**
 * v1.5.0: Validate search results quality (REQ-WF-002)
 */
export declare function validateSearchResults(results: SearchResult[], query: string): {
    valid: boolean;
    quality: number;
    issues: string[];
};
/**
 * Search DuckDuckGo with retry logic (REQ-ERR-001)
 *
 * @deprecated Use searchWithFallback() for v1.5.0 fallback support.
 * This function is kept for backward compatibility.
 */
export declare function searchDuckDuckGo(query: string, maxResults?: number): Promise<SearchResult[]>;
/**
 * Reset search infrastructure (for testing)
 * @internal
 */
export declare function resetSearchInfrastructure(): void;
import type { MultilingualSearchConfig } from '../config/types.js';
/**
 * 多言語検索結果の型定義
 */
export interface MultilingualSearchResult {
    query: {
        original: string;
        translated: string | null;
        detectedLanguage: 'ja' | 'en' | 'mixed';
    };
    results: Array<{
        url: string;
        title: string;
        snippet: string;
        sourceLanguage: 'ja' | 'en';
        relevanceScore?: number;
    }>;
    metadata: {
        totalResults: number;
        japaneseResults: number;
        englishResults: number;
        duplicatesRemoved: number;
        executionTimeMs: number;
    };
}
/**
 * 言語検出 (TSK-002)
 * REQ-SRCH-004-01: 言語検出
 */
export declare function detectLanguage(query: string): 'ja' | 'en' | 'mixed';
/**
 * クエリ翻訳 (TSK-003)
 * REQ-SRCH-004-02: クエリ翻訳
 * v1.7.0のBUILTIN_DICTIONARYを拡張して使用
 */
export declare function translateQuery(query: string, customDictionary?: Record<string, string>): string | null;
/**
 * URL正規化 (TSK-004)
 * REQ-SRCH-004-04: 結果マージと重複排除
 */
export declare function normalizeUrl(url: string): string;
/**
 * 多言語並列検索 (TSK-005)
 * REQ-SRCH-004-03: 並列検索実行
 *
 * 設定で`multilingualSearch.enabled: true`の場合に使用
 */
export declare function searchMultilingual(query: string, config?: Partial<MultilingualSearchConfig>): Promise<MultilingualSearchResult>;
export { enhanceSearchQuery, getPatentSearchUrls, canEnhanceQuery, type SearchEnhancementResult, } from './search/v115-search-enhancer.js';
//# sourceMappingURL=search.d.ts.map