/**
 * 同義語置換戦略
 *
 * TSK-003: 同義語置換戦略
 * REQ-SRCH-003: 検索失敗時の自動リカバリー
 * DES-SRCH-003: 検索リカバリーシステム設計
 */
import type { AlternativeQuery, RecoveryStrategy } from '../types.js';
import type { SynonymEntry } from '../../../../config/types.js';
/**
 * ビルトイン同義語辞書
 * 一般的なビジネス・技術用語の同義語マッピング
 */
export declare const BUILTIN_SYNONYMS: SynonymEntry[];
/**
 * 同義語置換戦略クラス
 */
export declare class SynonymStrategy implements RecoveryStrategy {
    readonly name: "synonym";
    readonly priority = 1;
    private readonly synonymMap;
    constructor(customDictionary?: SynonymEntry[]);
    /**
     * 同義語マップを構築
     */
    private buildSynonymMap;
    /**
     * この戦略が適用可能か判定
     */
    isApplicable(query: string): boolean;
    /**
     * 代替クエリを生成
     */
    generateAlternatives(query: string): AlternativeQuery[];
    /**
     * クエリをトークン化
     * 日本語と英語の両方に対応
     */
    private tokenize;
}
//# sourceMappingURL=synonym.d.ts.map