/**
 * RecoveryLogger - フォールバックログ統計・警告機能
 *
 * TSK-1-001: RecoveryLogger実装
 * REQ-SRCH-005-03: フォールバックログ
 * DES-SRCH-005-03: RecoveryLogger設計
 */
import type { RecoveryLogEntry } from './types.js';
/**
 * 戦略別統計
 */
export interface StrategyStats {
    /** 戦略名 */
    strategy: string;
    /** 試行回数 */
    attempts: number;
    /** 成功回数 */
    successCount: number;
    /** 成功率 */
    successRate: number;
    /** 平均処理時間（ms） */
    avgDurationMs: number;
}
/**
 * クエリ失敗情報
 */
export interface QueryFailureInfo {
    /** クエリ文字列 */
    query: string;
    /** 失敗回数 */
    failureCount: number;
    /** 最後の失敗日時 */
    lastFailure: Date;
    /** 試行した戦略一覧 */
    strategies: string[];
}
/**
 * リカバリー統計
 */
export interface RecoveryStats {
    /** 総試行回数 */
    totalAttempts: number;
    /** 成功回数 */
    successCount: number;
    /** 失敗回数 */
    failureCount: number;
    /** 成功率 */
    successRate: number;
    /** 平均処理時間（ms） */
    avgDurationMs: number;
    /** 戦略別統計 */
    byStrategy: Record<string, StrategyStats>;
    /** 高頻度失敗クエリ */
    highFrequencyFailures: QueryFailureInfo[];
    /** 統計期間開始 */
    periodStart: Date;
    /** 統計期間終了 */
    periodEnd: Date;
}
/**
 * 拡張ログエントリ（処理時間を含む）
 */
export interface ExtendedLogEntry extends RecoveryLogEntry {
    /** 一意のID */
    id: string;
    /** リカバリータイプ */
    type?: 'search' | 'visit';
    /** 処理時間（ms） */
    durationMs: number;
    /** エラーメッセージ（失敗時） */
    error?: string;
    /** 代替クエリの信頼度 */
    confidence?: number;
}
/**
 * ロガー設定
 */
export interface RecoveryLoggerConfig {
    /** 統計出力間隔（試行回数） */
    statsInterval: number;
    /** 高頻度失敗警告閾値 */
    warnThreshold: number;
    /** 最大ログエントリ保持数 */
    maxEntries: number;
    /** 統計集計期間（ms） */
    statsPeriodMs: number;
}
/**
 * デフォルト設定
 */
export declare const DEFAULT_LOGGER_CONFIG: RecoveryLoggerConfig;
/**
 * リカバリーログ管理クラス
 *
 * フォールバック試行のログ記録、統計計算、高頻度失敗クエリの検出を行う
 */
export declare class RecoveryLogger {
    private readonly entries;
    private readonly config;
    private readonly queryFailureMap;
    private attemptCount;
    private idCounter;
    constructor(config?: Partial<RecoveryLoggerConfig>);
    /**
     * UUIDライクなIDを生成
     */
    private generateId;
    /**
     * ログエントリを記録
     */
    log(entry: Omit<ExtendedLogEntry, 'id'>): void;
    /**
     * 失敗マップを更新
     */
    private updateFailureMap;
    /**
     * 高頻度失敗をチェックして警告
     */
    private checkHighFrequencyFailures;
    /**
     * 統計をstderrに出力
     */
    private outputStats;
    /**
     * 統計情報を取得
     */
    getStats(): RecoveryStats;
    /**
     * 高頻度失敗クエリを取得
     */
    getHighFrequencyQueries(threshold?: number): QueryFailureInfo[];
    /**
     * ログをJSON形式でエクスポート
     */
    exportToJson(): string;
    /**
     * ログエントリを取得
     */
    getEntries(): ExtendedLogEntry[];
    /**
     * ログをクリア
     */
    clear(): void;
    /**
     * 試行回数を取得
     */
    getAttemptCount(): number;
}
//# sourceMappingURL=logger.d.ts.map