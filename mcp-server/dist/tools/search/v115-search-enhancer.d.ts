/**
 * Search Enhancer - v1.15.0 Feature Integration
 * REQ-DICT-001: ドメイン辞書による検索クエリ拡張
 * REQ-PAT-001: 特許検索最適化
 *
 * @remarks
 * - DomainDictionaryManagerをsearch.tsワークフローに統合
 * - PatentSearchOptimizerをsearch.tsワークフローに統合
 * - キーワード検出による自動分岐
 * - TSK-020 実装
 */
import { type QueryExpansionResult } from '../search/dictionary/index.js';
import { type OptimizedPatentQuery } from '../search/patent/index.js';
import type { AnalysisType, DomainType } from '../utils/keyword-detector.js';
/**
 * 検索拡張結果
 */
export interface SearchEnhancementResult {
    /** 元のクエリ */
    originalQuery: string;
    /** 拡張されたクエリ */
    enhancedQuery: string;
    /** 追加の検索クエリ（複数展開時） */
    additionalQueries: string[];
    /** 検出された分析タイプ（複数検出可） */
    analysisTypes: AnalysisType[];
    /** 検出されたドメイン */
    domain?: DomainType | null;
    /** 辞書展開結果（使用時） */
    dictionaryExpansion?: QueryExpansionResult;
    /** 特許検索最適化結果（使用時） */
    patentOptimization?: OptimizedPatentQuery;
    /** 拡張が行われたか */
    wasEnhanced: boolean;
    /** 拡張の説明 */
    enhancementNotes: string[];
}
/**
 * 検索クエリを拡張
 *
 * @param query 元のクエリ
 * @returns 拡張結果
 */
export declare function enhanceSearchQuery(query: string): Promise<SearchEnhancementResult>;
/**
 * 特許検索URLを取得
 *
 * @param query クエリ
 * @returns 特許庁ごとの検索URL
 */
export declare function getPatentSearchUrls(query: string): Promise<Map<string, string>>;
/**
 * クエリがv1.15.0機能の恩恵を受けられるか判定
 *
 * @param query クエリ
 * @returns 拡張可能かどうかと理由
 */
export declare function canEnhanceQuery(query: string): {
    canEnhance: boolean;
    reasons: string[];
};
//# sourceMappingURL=v115-search-enhancer.d.ts.map