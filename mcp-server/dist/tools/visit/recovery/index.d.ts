/**
 * VisitRecoveryManager - ページ訪問リカバリーマネージャー
 *
 * TSK-1-004: VisitRecoveryManager実装
 * REQ-SRCH-004-01: visit失敗時フォールバック
 * REQ-SRCH-004-02: 自動リトライ
 * REQ-SRCH-004-03: 結果マージ
 * REQ-VISIT-004: アーカイブフォールバック（v1.11.0）
 * DES-SRCH-004: VisitRecoveryManager設計
 * DES-VISIT-004: Archive.today統合（v1.11.0）
 */
import { WaybackClient, type WaybackSnapshot, type WaybackClientConfig } from './wayback.js';
import { ArchiveTodayClient, type ArchiveTodaySnapshot, type ArchiveTodayClientConfig } from './archive-today.js';
import { RecoveryLogger, type RecoveryLoggerConfig } from '../../search/recovery/logger.js';
/**
 * ページ取得関数の型
 */
export type FetchFunction = (url: string) => Promise<PageFetchResult>;
/**
 * ページ取得結果
 */
export interface PageFetchResult {
    /** 取得に成功したかどうか */
    success: boolean;
    /** コンテンツ（成功時） */
    content?: string;
    /** タイトル（成功時） */
    title?: string;
    /** エラーメッセージ（失敗時） */
    error?: string;
    /** HTTPステータスコード */
    statusCode?: number;
}
/**
 * リカバリー結果
 */
export interface VisitRecoveryResult {
    /** 最終的に成功したかどうか */
    success: boolean;
    /** 元のURL */
    originalUrl: string;
    /** 実際に取得したURL（Wayback URLの可能性あり） */
    usedUrl: string;
    /** コンテンツ（成功時） */
    content?: string;
    /** タイトル（成功時） */
    title?: string;
    /** エラーメッセージ（失敗時） */
    error?: string;
    /** Wayback Machineを使用したかどうか */
    usedWayback: boolean;
    /** Archive.todayを使用したかどうか（v1.11.0） */
    usedArchiveToday?: boolean;
    /** Waybackスナップショット情報 */
    waybackSnapshot?: WaybackSnapshot;
    /** Archive.todayスナップショット情報（v1.11.0） */
    archiveTodaySnapshot?: ArchiveTodaySnapshot;
    /** 試行回数 */
    attempts: number;
    /** 処理時間（ms） */
    durationMs: number;
}
/**
 * VisitRecoveryManager 設定
 */
export interface VisitRecoveryConfig {
    /** 最大リトライ回数（デフォルト: 2） */
    maxRetries?: number;
    /** リトライ間隔（ms、デフォルト: 1000） */
    retryDelayMs?: number;
    /** タイムアウト（ms、デフォルト: 30000） */
    timeoutMs?: number;
    /** Wayback Machineを使用するかどうか（デフォルト: true） */
    enableWayback?: boolean;
    /** Archive.todayを使用するかどうか（デフォルト: true、v1.11.0） */
    enableArchiveToday?: boolean;
    /** WaybackClient設定 */
    waybackConfig?: Partial<WaybackClientConfig>;
    /** ArchiveTodayClient設定（v1.11.0） */
    archiveTodayConfig?: Partial<ArchiveTodayClientConfig>;
    /** RecoveryLogger設定 */
    loggerConfig?: Partial<RecoveryLoggerConfig>;
    /** RecoveryLoggerインスタンス（省略時は新規作成） */
    logger?: RecoveryLogger;
}
/**
 * デフォルト設定
 */
export declare const DEFAULT_VISIT_RECOVERY_CONFIG: Required<Omit<VisitRecoveryConfig, 'waybackConfig' | 'archiveTodayConfig' | 'loggerConfig' | 'logger'>>;
/**
 * VisitRecoveryManager - ページ訪問失敗時の自動リカバリー
 */
export declare class VisitRecoveryManager {
    private readonly config;
    private readonly waybackClient;
    private readonly archiveTodayClient;
    private readonly logger;
    constructor(config?: VisitRecoveryConfig);
    /**
     * リカバリー付きページ取得を実行
     * @param url 取得対象のURL
     * @param fetchFn ページ取得関数
     */
    recover(url: string, fetchFn: FetchFunction): Promise<VisitRecoveryResult>;
    /**
     * Wayback Machineを使用してリカバリーを試行
     */
    private tryWayback;
    /**
     * Archive.todayを使用してリカバリーを試行（v1.11.0）
     */
    private tryArchiveToday;
    /**
     * タイムアウト付きでページ取得を実行
     */
    private fetchWithTimeout;
    /**
     * リカバリー試行をログに記録
     */
    private logAttempt;
    /**
     * 指定時間待機
     */
    private delay;
    /**
     * RecoveryLoggerインスタンスを取得
     */
    getLogger(): RecoveryLogger;
    /**
     * 統計情報を取得
     */
    getStats(): ReturnType<RecoveryLogger['getStats']>;
    /**
     * WaybackClientインスタンスを取得
     */
    getWaybackClient(): WaybackClient | null;
    /**
     * ArchiveTodayClientインスタンスを取得（v1.11.0）
     */
    getArchiveTodayClient(): ArchiveTodayClient | null;
}
/**
 * VisitRecoveryManagerのファクトリ関数
 */
export declare function createVisitRecoveryManager(config?: VisitRecoveryConfig): VisitRecoveryManager;
//# sourceMappingURL=index.d.ts.map