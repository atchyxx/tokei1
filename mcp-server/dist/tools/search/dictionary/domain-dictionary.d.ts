/**
 * Domain Dictionary Manager
 *
 * v1.15.0: REQ-DICT-001 専門用語辞書・同義語展開
 *
 * 機能:
 * - YAML辞書の読み込み
 * - ドメイン自動検出
 * - 同義語展開（日英対応）
 * - 新語提案
 */
import type { DomainType, QueryExpansionResult, TermSuggestion } from './types.js';
/**
 * ドメイン辞書管理クラス
 */
export declare class DomainDictionaryManager {
    private dictionaries;
    private loaded;
    private configPath;
    private suggestions;
    constructor(configPath?: string);
    /**
     * デフォルトパスを解決
     */
    private resolveDefaultPath;
    /**
     * 辞書を読み込む
     */
    loadDictionaries(): Promise<void>;
    /**
     * 組み込み辞書を読み込む（フォールバック用）
     */
    private loadBuiltInDictionaries;
    /**
     * クエリからドメインを検出
     */
    detectDomain(query: string): DomainType | null;
    /**
     * クエリを同義語で展開
     */
    expandQuery(query: string, domain?: DomainType): string[];
    /**
     * 多言語展開（日英）
     */
    expandMultilingual(term: string, domain: DomainType): string[];
    /**
     * 完全なクエリ展開を実行
     */
    expandQueryFull(query: string): Promise<QueryExpansionResult>;
    /**
     * 新語を提案として記録
     */
    suggestNewTerm(term: string, domain: DomainType): void;
    /**
     * 2つの用語が類似しているかチェック（簡易実装）
     */
    private isSimilar;
    /**
     * 提案された新語を取得
     */
    getSuggestions(): TermSuggestion[];
    /**
     * 辞書がロード済みかどうか
     */
    isLoaded(): boolean;
    /**
     * 登録されているドメイン数
     */
    getDomainCount(): number;
}
/**
 * DomainDictionaryManager のシングルトンを取得
 */
export declare function getDomainDictionaryManager(): DomainDictionaryManager;
/**
 * シングルトンをリセット（テスト用）
 */
export declare function resetDomainDictionaryManager(): void;
//# sourceMappingURL=domain-dictionary.d.ts.map