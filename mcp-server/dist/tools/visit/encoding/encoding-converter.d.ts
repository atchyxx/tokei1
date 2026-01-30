/**
 * エンコーディング変換器
 *
 * @requirements REQ-VISIT-003, REQ-VISIT-003-01
 * @design DES-VISIT-003
 * @version 1.11.0
 */
import { SupportedEncoding, EncodingConversionResult, MojibakeDetectionResult } from './types.js';
/**
 * エンコーディング変換器
 * iconv-liteを使用してエンコーディング変換を行う
 */
export declare class EncodingConverter {
    /**
     * コンテンツをUTF-8に変換
     * @param content - 変換対象のバッファ
     * @param sourceEncoding - 元のエンコーディング
     */
    convertToUtf8(content: Buffer, sourceEncoding: SupportedEncoding): EncodingConversionResult;
    /**
     * 文字化けを検出
     * @param content - 検査対象の文字列
     */
    detectMojibake(content: string): MojibakeDetectionResult;
    /**
     * 文字化けを修正（再変換）
     * @param content - 修正対象のバッファ
     * @param suggestedEncoding - 推奨されるエンコーディング
     */
    fixMojibake(content: Buffer, suggestedEncoding: SupportedEncoding): EncodingConversionResult;
    /**
     * SupportedEncodingをiconv-liteのエンコーディング名にマッピング
     */
    private mapToIconvEncoding;
}
//# sourceMappingURL=encoding-converter.d.ts.map