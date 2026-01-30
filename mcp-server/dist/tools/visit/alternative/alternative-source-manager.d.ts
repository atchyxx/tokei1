/**
 * Alternative Source Manager
 * REQ-ALT-001: 代替情報源管理機能
 *
 * @remarks
 * - 有料コンテンツの代替情報源を提案
 * - DOI、arXiv ID、特許番号等の識別子を自動検出
 * - 優先度ベースで代替情報源をランキング
 * - TSK-005 実装
 */
import type { AlternativeSource, AlternativeSourceResult, ContentDetectionResult, ContentType, ExtractedIdentifier } from './types.js';
/**
 * 代替情報源マネージャー
 */
export declare class AlternativeSourceManager {
    private sources;
    private customSources;
    private loaded;
    private configPath;
    constructor(configPath?: string);
    /**
     * デフォルト設定パスを解決
     */
    private resolveDefaultPath;
    /**
     * 設定ファイルを読み込み
     */
    loadSources(): Promise<void>;
    /**
     * ビルトイン代替情報源を読み込み
     */
    private loadBuiltInSources;
    /**
     * コンテンツ種別を検出
     */
    detectContentType(url: string, text?: string): ContentDetectionResult;
    /**
     * URLおよびテキストから識別子を抽出
     */
    extractIdentifiers(url: string, text?: string): ExtractedIdentifier[];
    /**
     * 代替情報源を検索して提案
     */
    findAlternatives(url: string, text?: string, options?: {
        maxResults?: number;
        contentTypeHint?: ContentType;
    }): Promise<AlternativeSourceResult>;
    /**
     * 検索クエリを生成
     */
    private generateSearchQuery;
    /**
     * カスタム代替情報源を追加
     */
    addCustomSource(source: AlternativeSource): void;
    /**
     * 読み込み状態を確認
     */
    isLoaded(): boolean;
    /**
     * 代替情報源の数を取得
     */
    getSourceCount(): {
        byType: Map<ContentType, number>;
        custom: number;
    };
}
/**
 * AlternativeSourceManagerのシングルトンインスタンスを取得
 */
export declare function getAlternativeSourceManager(configPath?: string): AlternativeSourceManager;
//# sourceMappingURL=alternative-source-manager.d.ts.map