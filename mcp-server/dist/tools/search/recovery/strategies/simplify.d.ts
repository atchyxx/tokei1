/**
 * クエリ簡略化戦略
 *
 * TSK-004: クエリ簡略化戦略
 * REQ-SRCH-003: 検索失敗時の自動リカバリー
 * DES-SRCH-003: 検索リカバリーシステム設計
 */
import type { AlternativeQuery, RecoveryStrategy } from '../types.js';
/**
 * クエリ簡略化戦略クラス
 */
export declare class SimplifyStrategy implements RecoveryStrategy {
    readonly name: "simplify";
    readonly priority = 2;
    private readonly maxWords;
    constructor(maxWords?: number);
    /**
     * この戦略が適用可能か判定
     */
    isApplicable(query: string): boolean;
    /**
     * 代替クエリを生成
     */
    generateAlternatives(query: string): AlternativeQuery[];
    /**
     * 年号を削除
     */
    private removeYears;
    /**
     * ストップワードを削除
     */
    private removeStopwords;
    /**
     * 語数を制限
     */
    private truncateToMaxWords;
    /**
     * 単語の重要度を計算
     */
    private calculateWordImportance;
    /**
     * クエリをトークン化
     */
    private tokenize;
    /**
     * 連続スペースを正規化
     */
    private normalizeSpaces;
}
//# sourceMappingURL=simplify.d.ts.map