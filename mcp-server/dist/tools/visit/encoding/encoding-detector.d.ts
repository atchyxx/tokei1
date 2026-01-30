/**
 * エンコーディング検出器
 *
 * @requirements REQ-VISIT-003-01
 * @design DES-VISIT-003-01
 * @version 1.11.0
 */
import { SupportedEncoding, EncodingDetectionResult } from './types.js';
/**
 * エンコーディング検出器
 * Content-Type、meta charset、BOM、ヒューリスティックの順で検出
 */
export declare class EncodingDetector {
    /**
     * エンコーディングを検出
     * @param content - コンテンツ（Buffer）
     * @param contentType - Content-Typeヘッダー値（オプション）
     * @param html - HTMLコンテンツ（meta charset検出用、オプション）
     */
    detect(content: Buffer, contentType?: string, html?: string): EncodingDetectionResult;
    /**
     * Content-Type ヘッダーからエンコーディングを検出
     */
    detectFromContentType(contentType: string): EncodingDetectionResult | null;
    /**
     * HTML meta charset からエンコーディングを検出
     */
    detectFromMetaCharset(html: string): EncodingDetectionResult | null;
    /**
     * BOM (Byte Order Mark) からエンコーディングを検出
     */
    detectFromBom(content: Buffer): EncodingDetectionResult | null;
    /**
     * ヒューリスティックにエンコーディングを検出
     */
    detectHeuristic(content: Buffer): EncodingDetectionResult;
    /**
     * 有効なUTF-8シーケンスかチェック
     */
    private isValidUtf8;
    /**
     * Shift_JISらしいかチェック
     * Shift_JISの2バイト文字: 0x81-0x9F, 0xE0-0xFC + 0x40-0xFC
     */
    private looksLikeShiftJis;
    /**
     * EUC-JPらしいかチェック
     * EUC-JPの2バイト文字: 0xA1-0xFE + 0xA1-0xFE
     */
    private looksLikeEucJp;
    /**
     * ISO-2022-JPらしいかチェック
     * ISO-2022-JPはエスケープシーケンスを使用
     */
    private looksLikeIso2022Jp;
    /**
     * エンコーディング名を正規化
     */
    normalizeEncoding(encoding: string): SupportedEncoding | null;
}
//# sourceMappingURL=encoding-detector.d.ts.map