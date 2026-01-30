/**
 * Page Visit Tool
 *
 * Implements REQ-DR-002: Web検索 (page fetching)
 * Implements REQ-NF-007: プロバイダー設定ファイル対応
 * Implements REQ-PARSE-001: PDFコンテンツ抽出 (v1.7.0)
 * Implements REQ-SRCH-004: ページ訪問リカバリー (v1.10.0)
 * Implements REQ-HTTP-001: Exponential Backoff リトライ (v1.14.0)
 * Implements REQ-CONT-001: コンテンツ有効性検証 (v1.14.0)
 * Implements REQ-FRESH-001: 情報鮮度自動評価 (v1.14.0)
 * Uses Jina AI Reader for LLM-optimized text extraction
 */
import { VisitRecoveryManager } from './visit/recovery/index.js';
export interface PageContent {
    url: string;
    title: string;
    content: string;
    fetchedAt: string;
    error?: string;
    /** v1.7.0: PDFから抽出されたコンテンツかどうか */
    isPdf?: boolean;
    /** v1.7.0: PDFメタデータ */
    pdfMetadata?: {
        pageCount: number;
        author?: string;
        creationDate?: string;
    };
    /** v1.10.0: リカバリー情報 */
    recovery?: {
        /** Wayback Machine を使用したかどうか */
        usedWayback: boolean;
        /** 実際に取得したURL */
        usedUrl: string;
        /** 試行回数 */
        attempts: number;
        /** Waybackスナップショット日時（使用時） */
        waybackTimestamp?: string;
    };
    /** v1.14.0: コンテンツ検証結果 */
    validation?: {
        /** 検証ステータス */
        status: 'valid' | 'warning' | 'empty' | 'blocked' | 'too_short';
        /** 意味のある文字比率 */
        meaningfulRatio?: number;
        /** 警告メッセージ */
        warnings?: string[];
    };
    /** v1.14.0: 鮮度評価結果 */
    freshness?: {
        /** 鮮度レベル */
        level: 'fresh' | 'recent' | 'stale' | 'outdated' | 'unknown';
        /** 公開日 */
        publishDate?: string;
        /** 経過日数 */
        daysOld?: number;
        /** 鮮度スコア */
        score: number;
    };
}
/**
 * Visit a page and extract content using Jina AI Reader
 * v1.7.0: Auto-detect PDF and use PdfParser
 */
export declare function visitPage(url: string, goal?: string): Promise<PageContent>;
/**
 * v1.10.0: リカバリー付きページ訪問
 *
 * REQ-SRCH-004-01: visit失敗時フォールバック（Wayback Machine）
 * REQ-SRCH-004-02: 自動リトライ
 * REQ-SRCH-004-03: 結果マージ
 *
 * @param url 訪問対象のURL
 * @param goal 訪問の目的（オプション）
 * @returns ページコンテンツ
 */
export declare function visitPageWithRecovery(url: string, goal?: string): Promise<PageContent>;
/**
 * v1.10.0: リカバリー統計を取得
 */
export declare function getVisitRecoveryStats(): ReturnType<VisitRecoveryManager['getStats']> | null;
/**
 * v1.10.0: リカバリーマネージャーをリセット（テスト用）
 */
export declare function resetVisitRecoveryManager(): void;
export { analyzeBeforeVisit, extractStructuredData, enhanceVisit, getAlternativeSources, canEnhanceVisit, type VisitEnhancementResult, type ContentTypeHint, } from './visit/v115-visit-enhancer.js';
//# sourceMappingURL=visit.d.ts.map