/**
 * SearchRecoveryManager
 *
 * TSK-006: SearchRecoveryManager
 * TSK-1-002: RecoveryLogger連携
 * REQ-SRCH-003: 検索失敗時の自動リカバリー
 * REQ-SRCH-005-03: フォールバックログ
 * DES-SRCH-003: 検索リカバリーシステム設計
 */
import type { AlternativeQuery, RecoveryResult, RecoveryLogEntry } from './types.js';
import type { SearchRecoveryConfig } from '../../../config/types.js';
import { RecoveryLogger, type RecoveryStats, type RecoveryLoggerConfig } from './logger.js';
/**
 * 検索関数の型
 */
export type SearchFunction = (query: string) => Promise<unknown[]>;
/**
 * SearchRecoveryManager拡張設定
 */
export interface SearchRecoveryManagerConfig extends Partial<SearchRecoveryConfig> {
    /** RecoveryLoggerインスタンス（省略時は新規作成） */
    logger?: RecoveryLogger;
    /** RecoveryLogger設定（loggerが指定されていない場合に使用） */
    loggerConfig?: Partial<RecoveryLoggerConfig>;
}
/**
 * 検索リカバリーマネージャー
 *
 * 検索結果が0件の場合に、自動的に代替クエリを生成してリトライする
 */
export declare class SearchRecoveryManager {
    private readonly strategies;
    private readonly config;
    private readonly logEntries;
    private readonly logger;
    constructor(config?: SearchRecoveryManagerConfig);
    /**
     * 戦略を初期化
     */
    private initializeStrategies;
    /**
     * リカバリー付き検索を実行
     */
    recover(originalQuery: string, searchFn: SearchFunction): Promise<RecoveryResult>;
    /**
     * 代替クエリを生成
     */
    generateAlternatives(query: string): AlternativeQuery[];
    /**
     * タイムアウト付きで関数を実行
     */
    private executeWithTimeout;
    /**
     * リカバリー試行をログに記録
     */
    private logRecoveryAttempt;
    /**
     * ログエントリを取得（旧形式）
     */
    getLogEntries(): RecoveryLogEntry[];
    /**
     * ログをクリア
     */
    clearLog(): void;
    /**
     * 有効な戦略一覧を取得
     */
    getActiveStrategies(): string[];
    /**
     * 統計情報を取得
     * @returns RecoveryStats
     */
    getStats(): RecoveryStats;
    /**
     * 高頻度失敗クエリを取得
     * @param minFailures 最小失敗回数（省略時はデフォルトの閾値を使用）
     */
    getHighFrequencyQueries(minFailures?: number): ReturnType<RecoveryLogger['getHighFrequencyQueries']>;
    /**
     * RecoveryLoggerインスタンスを取得
     * @returns RecoveryLogger
     */
    getLogger(): RecoveryLogger;
}
export * from './types.js';
export * from './strategies/index.js';
export { RecoveryLogger, type ExtendedLogEntry, type RecoveryStats, type RecoveryLoggerConfig } from './logger.js';
//# sourceMappingURL=index.d.ts.map