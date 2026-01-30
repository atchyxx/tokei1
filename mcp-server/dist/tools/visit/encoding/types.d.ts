/**
 * エンコーディング処理 型定義
 *
 * @requirements REQ-VISIT-003, REQ-VISIT-003-01, REQ-VISIT-003-02
 * @design DES-VISIT-003
 * @version 1.11.0
 */
/**
 * サポートするエンコーディング
 */
export type SupportedEncoding = 'utf-8' | 'shift_jis' | 'euc-jp' | 'iso-2022-jp' | 'windows-31j';
/**
 * エンコーディング検出ソース
 */
export type EncodingDetectionSource = 'content-type' | 'meta-charset' | 'bom' | 'heuristic';
/**
 * エンコーディング検出結果
 */
export interface EncodingDetectionResult {
    /** 検出されたエンコーディング */
    detected: SupportedEncoding;
    /** 信頼度 (0.0-1.0) */
    confidence: number;
    /** 検出ソース */
    source: EncodingDetectionSource;
    /** 検出の詳細情報 */
    details?: string;
}
/**
 * 文字化けパターン
 */
export interface MojibakePattern {
    /** パターン名 */
    name: string;
    /** 検出パターン（正規表現文字列） */
    pattern: string;
    /** 推定される元エンコーディング */
    suggestedEncoding: SupportedEncoding;
    /** 誤変換元 */
    fromEncoding: string;
    /** 誤変換先 */
    toEncoding: string;
}
/**
 * 文字化け検出結果
 */
export interface MojibakeDetectionResult {
    /** 文字化けが検出されたか */
    hasMojibake: boolean;
    /** 検出されたパターン */
    patterns: MojibakePattern[];
    /** 推奨される再変換エンコーディング */
    suggestedEncoding?: SupportedEncoding;
    /** 信頼度 (0.0-1.0) */
    confidence: number;
}
/**
 * エンコーディング変換結果
 */
export interface EncodingConversionResult {
    /** 変換成功フラグ */
    success: boolean;
    /** 元のエンコーディング */
    originalEncoding: SupportedEncoding;
    /** 変換先エンコーディング */
    targetEncoding: SupportedEncoding;
    /** 変換後のコンテンツ */
    convertedContent: string;
    /** エラーメッセージ（失敗時） */
    error?: string;
    /** 変換時間（ms） */
    conversionTimeMs?: number;
}
/**
 * エンコーディング処理結果
 */
export interface EncodingProcessResult {
    /** 処理成功フラグ */
    success: boolean;
    /** 処理後のコンテンツ */
    content: string;
    /** 検出されたエンコーディング */
    detectedEncoding: SupportedEncoding;
    /** 変換が行われたか */
    wasConverted: boolean;
    /** 文字化け検出結果 */
    mojibakeResult?: MojibakeDetectionResult;
    /** エラーメッセージ（失敗時） */
    error?: string;
    /** 処理ログ */
    logs: string[];
}
/**
 * エンコーディングハンドラ設定
 */
export interface EncodingHandlerConfig {
    /** 文字化け検出を有効にするか */
    enableMojibakeDetection: boolean;
    /** 自動変換を有効にするか */
    enableAutoConversion: boolean;
    /** フォールバックエンコーディング */
    fallbackEncoding: SupportedEncoding;
    /** タイムアウト（ms） */
    timeoutMs: number;
    /** 詳細ログを有効にするか */
    verboseLogging: boolean;
}
/**
 * デフォルト設定
 */
export declare const DEFAULT_ENCODING_CONFIG: EncodingHandlerConfig;
/**
 * 文字化けパターン定義
 */
export declare const MOJIBAKE_PATTERNS: MojibakePattern[];
/**
 * BOMマッピング
 */
export declare const BOM_MAP: Record<string, SupportedEncoding>;
/**
 * エンコーディング名のエイリアスマップ
 */
export declare const ENCODING_ALIASES: Record<string, SupportedEncoding>;
//# sourceMappingURL=types.d.ts.map