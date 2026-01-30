/**
 * PdfParser
 *
 * TSK-014: PdfParserクラス
 * REQ-PARSE-001: PDFコンテンツ抽出
 * DES-PARSE-001: PDF解析システム設計
 */
import type { PdfDetectionResult, PdfParseResult } from './types.js';
import type { PdfParsingConfig } from '../../config/types.js';
/**
 * PdfParser クラス
 *
 * URLまたはローカルファイルからPDFを検出・解析する
 */
export declare class PdfParser {
    private readonly config;
    private pdfParseModule;
    constructor(config?: Partial<PdfParsingConfig>);
    /**
     * URLがPDFかどうか判定
     */
    isPdfUrl(url: string): PdfDetectionResult;
    /**
     * Content-TypeがPDFかどうか判定
     */
    isPdfContentType(contentType: string | null): boolean;
    /**
     * バッファがPDFかどうか判定（Magic Bytes）
     */
    isPdfBuffer(buffer: Buffer): PdfDetectionResult;
    /**
     * PDFを解析
     */
    parse(source: string | Buffer): Promise<PdfParseResult>;
    /**
     * タイムアウト付きでPDFを解析
     */
    private parseWithTimeout;
    /**
     * 実際のPDF解析処理
     */
    private doParse;
    /**
     * PDFをダウンロード
     */
    private downloadPdf;
    /**
     * PDF日付文字列をDateに変換
     */
    private parseDate;
    /**
     * エラーハンドリング
     */
    private handleParseError;
}
export * from './types.js';
//# sourceMappingURL=index.d.ts.map