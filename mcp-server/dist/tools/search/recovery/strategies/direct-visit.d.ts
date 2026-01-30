/**
 * Direct Visit Strategy - Level 3 検索リカバリー戦略
 *
 * REQ-SRCH-010: 検索結果空時の自動フォールバック
 * REQ-SRCH-010-03: 代表URL直接訪問戦略
 * DES-SHIKIGAMI-014 Section 3.1
 * TSK-TS-001
 *
 * @version 1.14.0
 */
import type { RecoveryStrategy, AlternativeQuery } from '../types.js';
/**
 * トピックURLマッピングの型定義
 */
export interface TopicUrlEntry {
    type: 'official' | 'wiki' | 'market_research';
    url: string;
    name: string;
}
export interface TopicMapping {
    keywords: {
        ja: string[];
        en: string[];
    };
    urls: TopicUrlEntry[];
}
export interface TopicRepresentativeUrlsConfig {
    version: string;
    priority_order: string[];
    max_urls: number;
    topics: Record<string, TopicMapping>;
    fallback?: {
        default_urls: TopicUrlEntry[];
        retry?: {
            max_attempts: number;
            delay_ms: number;
        };
    };
}
/**
 * 直接訪問結果
 */
export interface DirectVisitResult {
    success: boolean;
    query: string;
    matchedTopic?: string;
    visitedUrls: {
        url: string;
        name: string;
        type: string;
        success: boolean;
        contentLength?: number;
        error?: string;
    }[];
    totalContent: string;
}
/**
 * ページコンテンツの型
 */
export interface PageContent {
    title?: string;
    content: string;
    url: string;
    error?: string;
}
/**
 * 代表URL直接訪問関数の型
 */
export type DirectVisitFunction = (url: string) => Promise<PageContent>;
/**
 * DirectVisitStrategy - 代表URL直接訪問戦略
 *
 * 検索結果が空の場合、トピックに関連する代表URLを直接訪問して情報を取得
 */
export declare class DirectVisitStrategy implements RecoveryStrategy {
    readonly name = "direct_visit";
    readonly priority = 3;
    private config;
    private configPath;
    constructor(configPath?: string);
    /**
     * 設定ファイルを読み込み
     */
    private loadConfig;
    /**
     * この戦略が適用可能かどうかを判定
     */
    isApplicable(query: string): boolean;
    /**
     * 代替クエリを生成（この戦略では訪問URLを返す）
     */
    generateAlternatives(query: string): AlternativeQuery[];
    /**
     * クエリにマッチするトピックを検索
     */
    findMatchingTopics(query: string): string[];
    /**
     * 代表URLを直接訪問してコンテンツを取得
     */
    executeDirectVisit(query: string, visitFn: DirectVisitFunction): Promise<DirectVisitResult>;
    /**
     * 信頼度を計算
     */
    private calculateConfidence;
    /**
     * 設定を取得
     */
    getConfig(): TopicRepresentativeUrlsConfig | null;
    /**
     * 設定を再読み込み
     */
    reloadConfig(): void;
}
//# sourceMappingURL=direct-visit.d.ts.map