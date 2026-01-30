/**
 * WaybackClient - Wayback Machine API クライアント
 *
 * TSK-1-003: WaybackClient実装
 * REQ-SRCH-004-01: visit失敗時フォールバック
 * DES-SRCH-004: VisitRecoveryManager設計
 */
/**
 * Wayback Machine スナップショット情報
 */
export interface WaybackSnapshot {
    /** スナップショットURL */
    url: string;
    /** 元のURL */
    originalUrl: string;
    /** アーカイブ日時（ISO 8601形式） */
    timestamp: string;
    /** 利用可能かどうか */
    available: boolean;
    /** HTTPステータスコード */
    status?: number;
}
/**
 * Wayback Machine API レスポンス
 */
export interface WaybackApiResponse {
    archived_snapshots: {
        closest?: {
            url: string;
            timestamp: string;
            available: boolean;
            status?: string;
        };
    };
    url: string;
}
/**
 * WaybackClient 設定
 */
export interface WaybackClientConfig {
    /** APIベースURL（デフォルト: https://archive.org/wayback/available） */
    apiBaseUrl?: string;
    /** タイムアウト（ms、デフォルト: 10000） */
    timeoutMs?: number;
    /** 最大リトライ回数（デフォルト: 2） */
    maxRetries?: number;
    /** リトライ間隔（ms、デフォルト: 1000） */
    retryDelayMs?: number;
    /** User-Agent（デフォルト: SHIKIGAMI/1.10.0） */
    userAgent?: string;
}
/**
 * デフォルト設定
 */
export declare const DEFAULT_WAYBACK_CONFIG: Required<WaybackClientConfig>;
/**
 * WaybackClient - Wayback Machine APIを使ったページアーカイブ取得
 */
export declare class WaybackClient {
    private readonly config;
    constructor(config?: Partial<WaybackClientConfig>);
    /**
     * 指定URLの最新アーカイブスナップショットを取得
     * @param url 検索対象のURL
     * @returns スナップショット情報（見つからない場合はnull）
     */
    getSnapshot(url: string): Promise<WaybackSnapshot | null>;
    /**
     * 指定URLの利用可能なアーカイブがあるかチェック
     * @param url チェック対象のURL
     * @returns 利用可能な場合true
     */
    isArchived(url: string): Promise<boolean>;
    /**
     * アーカイブされたコンテンツのURLを取得（リダイレクト用）
     * @param url 元のURL
     * @returns アーカイブURL（見つからない場合はnull）
     */
    getArchiveUrl(url: string): Promise<string | null>;
    /**
     * Wayback Machine APIを呼び出してスナップショットを取得
     */
    private fetchSnapshot;
    /**
     * APIレスポンスをパース
     */
    private parseApiResponse;
    /**
     * Wayback Machine のタイムスタンプ（YYYYMMDDHHmmss）をISO 8601形式に変換
     */
    private formatTimestamp;
    /**
     * 指定時間待機
     */
    private delay;
}
/**
 * WaybackClientのシングルトンインスタンスを作成
 */
export declare function createWaybackClient(config?: Partial<WaybackClientConfig>): WaybackClient;
//# sourceMappingURL=wayback.d.ts.map