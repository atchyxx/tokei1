/**
 * Extractor Pipeline
 * REQ-EXT-001: 構造化データ抽出パイプライン
 *
 * @remarks
 * - 複数の抽出器を連携
 * - コンテンツタイプ自動検出
 * - 構造化データ出力
 * - TSK-011 実装
 */
import type { ExtractableContentType, ExtractionResult, ExtractorPipelineConfig } from './types.js';
/**
 * 抽出パイプラインクラス
 */
export declare class ExtractorPipeline {
    private config;
    constructor(config?: Partial<ExtractorPipelineConfig>);
    /**
     * コンテンツタイプを検出
     */
    detectContentType(html: string, url: string): ExtractableContentType;
    /**
     * HTML から構造化データを抽出
     */
    extract(html: string, url: string, contentTypeHint?: ExtractableContentType): Promise<ExtractionResult>;
    /**
     * 記事を抽出
     */
    private extractArticle;
    /**
     * 論文を抽出
     */
    private extractPaper;
    /**
     * 特許を抽出
     */
    private extractPatent;
    /**
     * 製品を抽出
     */
    private extractProduct;
    /**
     * テーブルを抽出
     */
    private extractTables;
    /**
     * 汎用抽出
     */
    private extractGeneral;
    private extractMeta;
    private extractTag;
    private extractAuthors;
    private extractPaperAuthors;
    private extractMainContent;
    private extractAbstract;
    private extractKeywords;
    private extractDOI;
    private extractPatentNumber;
    private extractPatentParties;
    private extractClassifications;
    private extractClaims;
    private extractImages;
    private extractTableHeaders;
    private extractTableRows;
    private stripTags;
    private createMetadata;
    private calculateConfidence;
}
/**
 * ExtractorPipelineのシングルトンインスタンスを取得
 */
export declare function getExtractorPipeline(config?: Partial<ExtractorPipelineConfig>): ExtractorPipeline;
//# sourceMappingURL=extractor-pipeline.d.ts.map