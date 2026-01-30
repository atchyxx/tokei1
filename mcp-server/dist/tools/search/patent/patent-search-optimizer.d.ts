/**
 * Patent Search Optimizer
 * REQ-PAT-001: 特許検索最適化機能
 *
 * @remarks
 * - 特許検索クエリを最適化
 * - IPC/CPC分類コードを自動推定
 * - 各特許庁に最適化されたクエリ生成
 * - TSK-010 実装
 */
import type { OptimizedPatentQuery, PatentClassification, PatentOffice, PatentSearchConfig, PatentSearchQuery } from './types.js';
/**
 * 特許検索最適化クラス
 */
export declare class PatentSearchOptimizer {
    private config;
    private classificationMappings;
    constructor(config?: Partial<PatentSearchConfig>);
    /**
     * ビルトインの分類コードマッピングを読み込み
     */
    private loadBuiltInMappings;
    /**
     * キーワードから分類コードを推定
     */
    suggestClassifications(keywords: string[]): PatentClassification[];
    /**
     * キーワードを特許検索用に展開
     */
    expandKeywords(keywords: string[]): string[];
    /**
     * 特許庁ごとの検索クエリを生成
     */
    generateOfficeQuery(query: PatentSearchQuery, office: PatentOffice): string;
    /**
     * JPO向けクエリ生成
     */
    private generateJPOQuery;
    /**
     * USPTO向けクエリ生成
     */
    private generateUSPTOQuery;
    /**
     * EPO向けクエリ生成
     */
    private generateEPOQuery;
    /**
     * WIPO向けクエリ生成
     */
    private generateWIPOQuery;
    /**
     * 検索URLを生成
     */
    generateSearchUrl(query: string, office: PatentOffice): string;
    /**
     * 特許検索クエリを最適化
     */
    optimizeQuery(query: PatentSearchQuery): OptimizedPatentQuery;
    /**
     * 簡易検索（キーワードのみ）
     */
    quickSearch(keywords: string[]): OptimizedPatentQuery;
}
/**
 * PatentSearchOptimizerのシングルトンインスタンスを取得
 */
export declare function getPatentSearchOptimizer(config?: Partial<PatentSearchConfig>): PatentSearchOptimizer;
/**
 * シングルトンインスタンスをリセット（テスト用）
 */
export declare function resetPatentSearchOptimizer(): void;
//# sourceMappingURL=patent-search-optimizer.d.ts.map