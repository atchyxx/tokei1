/**
 * 言語変換戦略
 *
 * TSK-005: 言語変換戦略
 * REQ-SRCH-003: 検索失敗時の自動リカバリー
 * DES-SRCH-003: 検索リカバリーシステム設計
 */
import type { AlternativeQuery, RecoveryStrategy } from '../types.js';
/**
 * ビルトイン日英辞書
 */
export declare const BUILTIN_DICTIONARY: Record<string, string>;
/**
 * 言語変換戦略クラス
 */
export declare class TranslateStrategy implements RecoveryStrategy {
    readonly name: "translate";
    readonly priority = 3;
    private readonly dictionary;
    constructor(customDictionary?: Record<string, string>);
    /**
     * この戦略が適用可能か判定
     */
    isApplicable(query: string): boolean;
    /**
     * 代替クエリを生成
     */
    generateAlternatives(query: string): AlternativeQuery[];
    /**
     * 日本語を英語に翻訳
     */
    private translateToEnglish;
    /**
     * 正規表現エスケープ
     */
    private escapeRegex;
}
//# sourceMappingURL=translate.d.ts.map