/**
 * Exponential Backoff - HTTPリトライ機構
 *
 * REQ-HTTP-001: HTTPエラーのインテリジェント・リトライ
 * DES-SHIKIGAMI-014 Section 3.2
 * TSK-TS-002
 *
 * @version 1.14.0
 */
/**
 * Exponential Backoff設定
 */
export interface ExponentialBackoffConfig {
    /** 初期遅延（ms、デフォルト: 1000） */
    initialDelayMs?: number;
    /** 最大遅延（ms、デフォルト: 30000） */
    maxDelayMs?: number;
    /** 乗数（デフォルト: 2） */
    multiplier?: number;
    /** ジッター（0-1、デフォルト: 0.1） */
    jitter?: number;
    /** 最大リトライ回数（デフォルト: 3） */
    maxRetries?: number;
    /** リトライ可能なHTTPステータスコード */
    retryableStatusCodes?: number[];
}
/**
 * デフォルト設定
 */
export declare const DEFAULT_BACKOFF_CONFIG: Required<ExponentialBackoffConfig>;
/**
 * リトライ結果
 */
export interface RetryResult<T> {
    /** 成功したかどうか */
    success: boolean;
    /** 結果（成功時） */
    result?: T;
    /** エラー（失敗時） */
    error?: Error;
    /** 試行回数 */
    attempts: number;
    /** 総遅延時間（ms） */
    totalDelayMs: number;
    /** 各試行の詳細 */
    attemptDetails: AttemptDetail[];
}
/**
 * 試行詳細
 */
export interface AttemptDetail {
    /** 試行番号 */
    attempt: number;
    /** 遅延時間（ms） */
    delayMs: number;
    /** HTTPステータスコード */
    statusCode?: number;
    /** エラーメッセージ */
    error?: string;
    /** タイムスタンプ */
    timestamp: Date;
}
/**
 * HTTP操作関数の型
 */
export type HttpOperation<T> = () => Promise<{
    result: T;
    statusCode: number;
}>;
/**
 * 遅延時間を計算（ジッター付き）
 */
export declare function calculateDelay(attempt: number, config: Required<ExponentialBackoffConfig>): number;
/**
 * HTTPステータスコードがリトライ可能かどうかを判定
 */
export declare function isRetryableStatusCode(statusCode: number, retryableCodes: number[]): boolean;
/**
 * HTTPステータスコードの説明を取得
 */
export declare function getStatusCodeDescription(statusCode: number): string;
/**
 * Exponential Backoffでリトライを実行
 */
export declare function retryWithBackoff<T>(operation: HttpOperation<T>, config?: ExponentialBackoffConfig): Promise<RetryResult<T>>;
/**
 * ExponentialBackoffManager - HTTP操作のリトライを管理
 */
export declare class ExponentialBackoffManager {
    private readonly config;
    constructor(config?: ExponentialBackoffConfig);
    /**
     * リトライを実行
     */
    retry<T>(operation: HttpOperation<T>): Promise<RetryResult<T>>;
    /**
     * 設定を取得
     */
    getConfig(): Required<ExponentialBackoffConfig>;
    /**
     * リトライ可能なステータスコードを追加
     */
    addRetryableStatusCode(statusCode: number): void;
    /**
     * リトライ可能なステータスコードを削除
     */
    removeRetryableStatusCode(statusCode: number): void;
}
//# sourceMappingURL=exponential-backoff.d.ts.map