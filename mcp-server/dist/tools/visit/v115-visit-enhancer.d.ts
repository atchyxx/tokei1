/**
 * Visit Enhancer - v1.15.0 Feature Integration
 * REQ-ALT-001: 代替情報源管理
 * REQ-EXT-001: 構造化データ抽出
 * REQ-PAY-001: ペイウォール検知
 *
 * @remarks
 * - AlternativeSourceManagerをvisit.tsワークフローに統合
 * - ExtractorPipelineをvisit.tsワークフローに統合
 * - PaywallDetectorをvisit.tsワークフローに統合
 * - TSK-021 実装
 */
import { type AlternativeSourceResult, type ContentType } from '../visit/alternative/index.js';
import { type ExtractionResult, type PaywallDetectionResult } from '../visit/extractor/index.js';
/**
 * ページ訪問拡張結果
 */
export interface VisitEnhancementResult {
    /** 元のURL */
    originalUrl: string;
    /** ペイウォール検知結果 */
    paywallDetection?: PaywallDetectionResult;
    /** 代替情報源 */
    alternativeSources?: AlternativeSourceResult;
    /** 構造化データ抽出結果 */
    structuredData?: ExtractionResult;
    /** 拡張が行われたか */
    wasEnhanced: boolean;
    /** 拡張の説明 */
    enhancementNotes: string[];
}
/**
 * コンテンツタイプヒント
 */
export interface ContentTypeHint {
    type?: ContentType;
    isPaper?: boolean;
    isPatent?: boolean;
    isNews?: boolean;
    isTechnicalDoc?: boolean;
}
/**
 * ページ訪問前の分析（ペイウォール検知・代替情報源提案）
 *
 * @param url 訪問予定のURL
 * @param html HTMLコンテンツ（取得済みの場合）
 * @param contentHint コンテンツタイプのヒント
 * @returns 分析結果
 */
export declare function analyzeBeforeVisit(url: string, html?: string, contentHint?: ContentTypeHint): Promise<VisitEnhancementResult>;
/**
 * ページ訪問後の構造化データ抽出
 *
 * @param url 訪問したURL
 * @param html 取得したHTMLコンテンツ
 * @param contentHint コンテンツタイプのヒント
 * @returns 抽出結果
 */
export declare function extractStructuredData(url: string, html: string, contentHint?: ContentTypeHint): Promise<ExtractionResult | undefined>;
/**
 * 完全な訪問拡張（分析 + 抽出）
 *
 * @param url 訪問したURL
 * @param html 取得したHTMLコンテンツ
 * @param contentHint コンテンツタイプのヒント
 * @returns 拡張結果
 */
export declare function enhanceVisit(url: string, html: string, contentHint?: ContentTypeHint): Promise<VisitEnhancementResult>;
/**
 * 代替情報源の提案を取得（ペイウォール検出時用）
 *
 * @param url 元のURL
 * @param html HTMLコンテンツ（オプション）
 * @returns 代替情報源リスト
 */
export declare function getAlternativeSources(url: string, html?: string): Promise<{
    url: string;
    name: string;
    confidence: number;
    reason: string;
}[]>;
/**
 * URLがv1.15.0機能の恩恵を受けられるか判定
 *
 * @param url URL
 * @returns 拡張可能かどうかと理由
 */
export declare function canEnhanceVisit(url: string): {
    canEnhance: boolean;
    reasons: string[];
};
//# sourceMappingURL=v115-visit-enhancer.d.ts.map