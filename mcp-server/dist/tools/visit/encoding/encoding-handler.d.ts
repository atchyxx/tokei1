/**
 * エンコーディング処理ハンドラ
 *
 * @requirements REQ-VISIT-003, REQ-VISIT-003-01, REQ-VISIT-003-02
 * @design DES-VISIT-003
 * @version 1.11.0
 */
import { EncodingProcessResult, EncodingHandlerConfig } from './types.js';
/**
 * エンコーディング処理ハンドラ
 * 検出、変換、文字化け修正を統合的に処理
 */
export declare class EncodingHandler {
    private readonly detector;
    private readonly converter;
    private readonly config;
    constructor(config?: Partial<EncodingHandlerConfig>);
    /**
     * コンテンツを処理（検出→変換→文字化け検出）
     * @param content - 処理対象のバッファ
     * @param contentType - Content-Typeヘッダー（オプション）
     * @param html - HTMLコンテンツ（meta charset検出用、オプション）
     */
    process(content: Buffer, contentType?: string, html?: string): Promise<EncodingProcessResult>;
    /**
     * 内部処理ロジック
     */
    private processInternal;
    /**
     * タイムアウト付きPromise実行
     */
    private withTimeout;
    /**
     * 設定を取得
     */
    getConfig(): EncodingHandlerConfig;
}
//# sourceMappingURL=encoding-handler.d.ts.map