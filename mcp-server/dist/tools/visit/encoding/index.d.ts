/**
 * エンコーディング処理モジュール
 *
 * @module visit/encoding
 * @requirements REQ-VISIT-003, REQ-VISIT-003-01, REQ-VISIT-003-02
 * @design DES-VISIT-003
 * @version 1.11.0
 */
export * from './types.js';
export { EncodingDetector } from './encoding-detector.js';
export { EncodingConverter } from './encoding-converter.js';
export { EncodingHandler } from './encoding-handler.js';
import { EncodingHandler } from './encoding-handler.js';
import { EncodingHandlerConfig } from './types.js';
/**
 * デフォルトのエンコーディングハンドラを取得
 */
export declare function getDefaultEncodingHandler(): EncodingHandler;
/**
 * カスタム設定でエンコーディングハンドラを作成
 */
export declare function createEncodingHandler(config?: Partial<EncodingHandlerConfig>): EncodingHandler;
/**
 * コンテンツを処理する便利関数
 * @param content - 処理対象のバッファ
 * @param contentType - Content-Typeヘッダー（オプション）
 * @param html - HTMLコンテンツ（meta charset検出用、オプション）
 */
export declare function processEncoding(content: Buffer, contentType?: string, html?: string): Promise<import("./types.js").EncodingProcessResult>;
//# sourceMappingURL=index.d.ts.map