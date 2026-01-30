/**
 * WaybackClient - Wayback Machine API クライアント
 *
 * TSK-1-003: WaybackClient実装
 * REQ-SRCH-004-01: visit失敗時フォールバック
 * DES-SRCH-004: VisitRecoveryManager設計
 */
/**
 * デフォルト設定
 */
export const DEFAULT_WAYBACK_CONFIG = {
    apiBaseUrl: 'https://archive.org/wayback/available',
    timeoutMs: 10000,
    maxRetries: 2,
    retryDelayMs: 1000,
    userAgent: 'SHIKIGAMI/1.10.0',
};
/**
 * WaybackClient - Wayback Machine APIを使ったページアーカイブ取得
 */
export class WaybackClient {
    config;
    constructor(config) {
        this.config = { ...DEFAULT_WAYBACK_CONFIG, ...config };
    }
    /**
     * 指定URLの最新アーカイブスナップショットを取得
     * @param url 検索対象のURL
     * @returns スナップショット情報（見つからない場合はnull）
     */
    async getSnapshot(url) {
        let lastError = null;
        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                return await this.fetchSnapshot(url);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt < this.config.maxRetries) {
                    await this.delay(this.config.retryDelayMs);
                }
            }
        }
        console.error(`[WaybackClient] Failed to get snapshot for "${url}" after ${this.config.maxRetries + 1} attempts: ${lastError?.message}`);
        return null;
    }
    /**
     * 指定URLの利用可能なアーカイブがあるかチェック
     * @param url チェック対象のURL
     * @returns 利用可能な場合true
     */
    async isArchived(url) {
        const snapshot = await this.getSnapshot(url);
        return snapshot?.available ?? false;
    }
    /**
     * アーカイブされたコンテンツのURLを取得（リダイレクト用）
     * @param url 元のURL
     * @returns アーカイブURL（見つからない場合はnull）
     */
    async getArchiveUrl(url) {
        const snapshot = await this.getSnapshot(url);
        return snapshot?.available ? snapshot.url : null;
    }
    /**
     * Wayback Machine APIを呼び出してスナップショットを取得
     */
    async fetchSnapshot(url) {
        const apiUrl = `${this.config.apiBaseUrl}?url=${encodeURIComponent(url)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': this.config.userAgent,
                    Accept: 'application/json',
                },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = (await response.json());
            return this.parseApiResponse(data, url);
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Request timed out after ${this.config.timeoutMs}ms`);
            }
            throw error;
        }
    }
    /**
     * APIレスポンスをパース
     */
    parseApiResponse(data, originalUrl) {
        const closest = data.archived_snapshots?.closest;
        if (!closest) {
            return null;
        }
        return {
            url: closest.url,
            originalUrl,
            timestamp: this.formatTimestamp(closest.timestamp),
            available: closest.available,
            status: closest.status ? parseInt(closest.status, 10) : undefined,
        };
    }
    /**
     * Wayback Machine のタイムスタンプ（YYYYMMDDHHmmss）をISO 8601形式に変換
     */
    formatTimestamp(timestamp) {
        if (timestamp.length !== 14) {
            return timestamp;
        }
        const year = timestamp.substring(0, 4);
        const month = timestamp.substring(4, 6);
        const day = timestamp.substring(6, 8);
        const hour = timestamp.substring(8, 10);
        const minute = timestamp.substring(10, 12);
        const second = timestamp.substring(12, 14);
        return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    }
    /**
     * 指定時間待機
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
/**
 * WaybackClientのシングルトンインスタンスを作成
 */
export function createWaybackClient(config) {
    return new WaybackClient(config);
}
//# sourceMappingURL=wayback.js.map