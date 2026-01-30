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
import { WaybackClient } from './wayback.js';
import { ArchiveTodayClient } from './archive-today.js';
import { RecoveryLogger } from '../../search/recovery/logger.js';
/**
 * デフォルト設定
 */
export const DEFAULT_VISIT_RECOVERY_CONFIG = {
    maxRetries: 2,
    retryDelayMs: 1000,
    timeoutMs: 30000,
    enableWayback: true,
    enableArchiveToday: true,
};
/**
 * VisitRecoveryManager - ページ訪問失敗時の自動リカバリー
 */
export class VisitRecoveryManager {
    config;
    waybackClient;
    archiveTodayClient;
    logger;
    constructor(config) {
        const { waybackConfig, archiveTodayConfig, loggerConfig, logger, ...restConfig } = config ?? {};
        this.config = { ...DEFAULT_VISIT_RECOVERY_CONFIG, ...restConfig };
        this.waybackClient = this.config.enableWayback ? new WaybackClient(waybackConfig) : null;
        this.archiveTodayClient = this.config.enableArchiveToday ? new ArchiveTodayClient(archiveTodayConfig) : null;
        this.logger = logger ?? new RecoveryLogger(loggerConfig);
    }
    /**
     * リカバリー付きページ取得を実行
     * @param url 取得対象のURL
     * @param fetchFn ページ取得関数
     */
    async recover(url, fetchFn) {
        const startTime = Date.now();
        let attempts = 0;
        let lastError;
        // 1. 元のURLでリトライ
        for (let i = 0; i <= this.config.maxRetries; i++) {
            attempts++;
            const attemptStart = Date.now();
            try {
                const result = await this.fetchWithTimeout(fetchFn, url);
                const durationMs = Date.now() - attemptStart;
                if (result.success) {
                    this.logAttempt(url, url, 'direct', true, durationMs);
                    return {
                        success: true,
                        originalUrl: url,
                        usedUrl: url,
                        content: result.content,
                        title: result.title,
                        usedWayback: false,
                        attempts,
                        durationMs: Date.now() - startTime,
                    };
                }
                lastError = result.error ?? 'Unknown error';
                this.logAttempt(url, url, 'direct', false, durationMs, lastError);
            }
            catch (error) {
                const durationMs = Date.now() - attemptStart;
                lastError = error instanceof Error ? error.message : String(error);
                this.logAttempt(url, url, 'direct', false, durationMs, lastError);
            }
            // リトライ前に待機
            if (i < this.config.maxRetries) {
                await this.delay(this.config.retryDelayMs);
            }
        }
        // 2. Wayback Machineを使用してリカバリー
        if (this.waybackClient) {
            const waybackResult = await this.tryWayback(url, fetchFn, startTime, attempts);
            if (waybackResult) {
                return waybackResult;
            }
            attempts++; // Waybackの試行をカウント
        }
        // 3. Archive.todayを使用してリカバリー（v1.11.0）
        if (this.archiveTodayClient) {
            const archiveTodayResult = await this.tryArchiveToday(url, fetchFn, startTime, attempts);
            if (archiveTodayResult) {
                return archiveTodayResult;
            }
            attempts++; // Archive.todayの試行をカウント
        }
        // 4. すべての試行が失敗
        return {
            success: false,
            originalUrl: url,
            usedUrl: url,
            error: lastError ?? 'All recovery attempts failed',
            usedWayback: false,
            attempts,
            durationMs: Date.now() - startTime,
        };
    }
    /**
     * Wayback Machineを使用してリカバリーを試行
     */
    async tryWayback(originalUrl, fetchFn, startTime, currentAttempts) {
        if (!this.waybackClient) {
            return null;
        }
        const waybackAttemptStart = Date.now();
        const snapshot = await this.waybackClient.getSnapshot(originalUrl);
        if (!snapshot?.available) {
            this.logAttempt(originalUrl, originalUrl, 'wayback-check', false, Date.now() - waybackAttemptStart, 'No archive available');
            return null;
        }
        const attemptStart = Date.now();
        try {
            const result = await this.fetchWithTimeout(fetchFn, snapshot.url);
            const durationMs = Date.now() - attemptStart;
            if (result.success) {
                this.logAttempt(originalUrl, snapshot.url, 'wayback', true, durationMs);
                return {
                    success: true,
                    originalUrl,
                    usedUrl: snapshot.url,
                    content: result.content,
                    title: result.title,
                    usedWayback: true,
                    waybackSnapshot: snapshot,
                    attempts: currentAttempts + 1,
                    durationMs: Date.now() - startTime,
                };
            }
            this.logAttempt(originalUrl, snapshot.url, 'wayback', false, durationMs, result.error);
        }
        catch (error) {
            const durationMs = Date.now() - attemptStart;
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logAttempt(originalUrl, snapshot.url, 'wayback', false, durationMs, errorMsg);
        }
        return null;
    }
    /**
     * Archive.todayを使用してリカバリーを試行（v1.11.0）
     */
    async tryArchiveToday(originalUrl, fetchFn, startTime, currentAttempts) {
        if (!this.archiveTodayClient) {
            return null;
        }
        const archiveTodayAttemptStart = Date.now();
        const snapshot = await this.archiveTodayClient.getSnapshot(originalUrl);
        if (!snapshot?.available) {
            this.logAttempt(originalUrl, originalUrl, 'archive-today-check', false, Date.now() - archiveTodayAttemptStart, 'No archive available');
            return null;
        }
        const attemptStart = Date.now();
        try {
            const result = await this.fetchWithTimeout(fetchFn, snapshot.url);
            const durationMs = Date.now() - attemptStart;
            if (result.success) {
                this.logAttempt(originalUrl, snapshot.url, 'archive-today', true, durationMs);
                return {
                    success: true,
                    originalUrl,
                    usedUrl: snapshot.url,
                    content: result.content,
                    title: result.title,
                    usedWayback: false,
                    usedArchiveToday: true,
                    archiveTodaySnapshot: snapshot,
                    attempts: currentAttempts + 1,
                    durationMs: Date.now() - startTime,
                };
            }
            this.logAttempt(originalUrl, snapshot.url, 'archive-today', false, durationMs, result.error);
        }
        catch (error) {
            const durationMs = Date.now() - attemptStart;
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logAttempt(originalUrl, snapshot.url, 'archive-today', false, durationMs, errorMsg);
        }
        return null;
    }
    /**
     * タイムアウト付きでページ取得を実行
     */
    async fetchWithTimeout(fetchFn, url) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Request timed out after ${this.config.timeoutMs}ms`));
            }, this.config.timeoutMs);
            fetchFn(url)
                .then((result) => {
                clearTimeout(timer);
                resolve(result);
            })
                .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }
    /**
     * リカバリー試行をログに記録
     */
    logAttempt(originalUrl, usedUrl, strategy, success, durationMs, error) {
        const entry = {
            originalQuery: originalUrl,
            alternativeQuery: usedUrl,
            strategy,
            resultCount: success ? 1 : 0,
            success,
            timestamp: new Date(),
            durationMs,
            type: 'visit',
            error,
        };
        this.logger.log(entry);
        // stderr にログ出力
        console.error(`[VisitRecovery] ${success ? '✓' : '✗'} "${originalUrl}" ${usedUrl !== originalUrl ? `→ "${usedUrl}"` : ''} (${strategy}) ${durationMs}ms`);
    }
    /**
     * 指定時間待機
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * RecoveryLoggerインスタンスを取得
     */
    getLogger() {
        return this.logger;
    }
    /**
     * 統計情報を取得
     */
    getStats() {
        return this.logger.getStats();
    }
    /**
     * WaybackClientインスタンスを取得
     */
    getWaybackClient() {
        return this.waybackClient;
    }
    /**
     * ArchiveTodayClientインスタンスを取得（v1.11.0）
     */
    getArchiveTodayClient() {
        return this.archiveTodayClient;
    }
}
/**
 * VisitRecoveryManagerのファクトリ関数
 */
export function createVisitRecoveryManager(config) {
    return new VisitRecoveryManager(config);
}
//# sourceMappingURL=index.js.map