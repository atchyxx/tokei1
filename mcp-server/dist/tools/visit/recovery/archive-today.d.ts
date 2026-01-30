/**
 * Archive.today クライアント
 *
 * @requirements REQ-VISIT-004, REQ-VISIT-004-01
 * @design DES-VISIT-004-01
 * @version 1.11.0
 */
/**
 * Archive.today スナップショット情報
 */
export interface ArchiveTodaySnapshot {
    /** アーカイブURL */
    url: string;
    /** 元のURL */
    originalUrl: string;
    /** アーカイブ日時（ISO 8601形式） */
    timestamp: string;
    /** 利用可能かどうか */
    available: boolean;
}
/**
 * Archive.today クライアント設定
 */
export interface ArchiveTodayClientConfig {
    /** APIベースURL */
    baseUrl?: string;
    /** タイムアウト（ms） */
    timeoutMs?: number;
    /** 最大リトライ回数 */
    maxRetries?: number;
    /** リトライ間隔（ms） */
    retryDelayMs?: number;
    /** User-Agent */
    userAgent?: string;
}
/**
 * デフォルト設定
 */
export declare const DEFAULT_ARCHIVE_TODAY_CONFIG: Required<ArchiveTodayClientConfig>;
/**
 * Archive.today クライアント
 * Archive.today（旧 archive.is）からアーカイブを取得
 */
export declare class ArchiveTodayClient {
    private readonly config;
    constructor(config?: Partial<ArchiveTodayClientConfig>);
    /**
     * 指定URLの最新アーカイブスナップショットを取得
     * @param url 検索対象のURL
     * @returns スナップショット情報（見つからない場合はnull）
     */
    getSnapshot(url: string): Promise<ArchiveTodaySnapshot | null>;
    /**
     * 指定URLの利用可能なアーカイブがあるかチェック
     * @param url チェック対象のURL
     * @returns 利用可能な場合true
     */
    isArchived(url: string): Promise<boolean>;
    /**
     * アーカイブされたコンテンツのURLを取得
     * @param url 元のURL
     * @returns アーカイブURL（見つからない場合はnull）
     */
    getArchiveUrl(url: string): Promise<string | null>;
    /**
     * Archive.today からスナップショットを取得
     * Archive.todayは直接的なAPIを提供していないため、
     * timemap形式でのアクセスを試みる
     */
    private fetchSnapshot;
    /**
     * Timemap形式のレスポンスをパース
     * Link-Format (RFC 5988) または HTML形式をサポート
     */
    private parseTimemapResponse;
    /**
     * 最新アーカイブを取得（newest エンドポイント）
     */
    private fetchNewestArchive;
    /**
     * 指定時間待機
     */
    private delay;
}
/**
 * ArchiveTodayClientのインスタンスを作成
 */
export declare function createArchiveTodayClient(config?: Partial<ArchiveTodayClientConfig>): ArchiveTodayClient;
//# sourceMappingURL=archive-today.d.ts.map