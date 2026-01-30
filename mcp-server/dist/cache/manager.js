/**
 * Query Cache Manager
 * v1.0.0 - REQ-CACHE-001-01
 *
 * 検索・訪問クエリのキャッシュ管理
 */
import { FileCacheStore, createCacheStore } from './store.js';
/**
 * クエリキャッシュマネージャー
 * 検索、訪問、埋め込みなどのクエリ結果をキャッシュ
 */
export class QueryCacheManager {
    store;
    config;
    evictionTimer;
    statsSaveTimer;
    constructor(config = {}) {
        this.config = {
            evictionIntervalSeconds: 300, // 5分
            statsSaveIntervalSeconds: 60, // 1分
            ...config,
        };
        this.store = createCacheStore(config);
    }
    /**
     * 定期的なメンテナンスタスクを開始
     */
    startMaintenanceTasks() {
        // 期限切れ削除タイマー
        if (this.config.evictionIntervalSeconds && this.config.evictionIntervalSeconds > 0) {
            this.evictionTimer = setInterval(() => this.store.evictExpired(), this.config.evictionIntervalSeconds * 1000);
        }
        // 統計保存タイマー
        if (this.config.statsSaveIntervalSeconds && this.config.statsSaveIntervalSeconds > 0) {
            this.statsSaveTimer = setInterval(() => this.store.saveStats(), this.config.statsSaveIntervalSeconds * 1000);
        }
    }
    /**
     * メンテナンスタスクを停止
     */
    stopMaintenanceTasks() {
        if (this.evictionTimer) {
            clearInterval(this.evictionTimer);
            this.evictionTimer = undefined;
        }
        if (this.statsSaveTimer) {
            clearInterval(this.statsSaveTimer);
            this.statsSaveTimer = undefined;
        }
    }
    /**
     * 検索クエリのキャッシュキーを生成
     */
    static generateSearchKey(params) {
        const { query, engine = 'default', options = {} } = params;
        const optionsStr = Object.keys(options).length > 0 ? JSON.stringify(options) : '';
        return `search:${engine}:${query}${optionsStr ? ':' + optionsStr : ''}`;
    }
    /**
     * 訪問クエリのキャッシュキーを生成
     */
    static generateVisitKey(params) {
        const { url, options = {} } = params;
        const optionsStr = Object.keys(options).length > 0 ? JSON.stringify(options) : '';
        return `visit:${url}${optionsStr ? ':' + optionsStr : ''}`;
    }
    /**
     * 埋め込みキャッシュキーを生成
     */
    static generateEmbeddingKey(params) {
        const { text, model = 'default' } = params;
        // テキストが長い場合はハッシュ化
        const textKey = text.length > 100 ? FileCacheStore.generateQueryHash(text) : text;
        return `embedding:${model}:${textKey}`;
    }
    /**
     * 検索結果をキャッシュから取得
     */
    async getSearchResult(params) {
        const key = QueryCacheManager.generateSearchKey(params);
        return this.store.get(key);
    }
    /**
     * 検索結果をキャッシュに保存
     */
    async setSearchResult(params, value, options = {}) {
        const key = QueryCacheManager.generateSearchKey(params);
        await this.store.set(key, value, { ...options, source: 'search' });
    }
    /**
     * 訪問結果をキャッシュから取得
     */
    async getVisitResult(params) {
        const key = QueryCacheManager.generateVisitKey(params);
        return this.store.get(key);
    }
    /**
     * 訪問結果をキャッシュに保存
     */
    async setVisitResult(params, value, options = {}) {
        const key = QueryCacheManager.generateVisitKey(params);
        await this.store.set(key, value, { ...options, source: 'visit' });
    }
    /**
     * 埋め込みベクトルをキャッシュから取得
     */
    async getEmbedding(params) {
        const key = QueryCacheManager.generateEmbeddingKey(params);
        return this.store.get(key);
    }
    /**
     * 埋め込みベクトルをキャッシュに保存
     */
    async setEmbedding(params, value, options = {}) {
        const key = QueryCacheManager.generateEmbeddingKey(params);
        await this.store.set(key, value, { ...options, source: 'embedding' });
    }
    /**
     * 汎用的なキャッシュ取得
     */
    async get(key) {
        return this.store.get(key);
    }
    /**
     * 汎用的なキャッシュ保存
     */
    async set(key, value, options = {}) {
        await this.store.set(key, value, options);
    }
    /**
     * キャッシュエントリを削除
     */
    async delete(key) {
        return this.store.delete(key);
    }
    /**
     * URLに関連するキャッシュを削除
     */
    async invalidateUrl(url) {
        let deletedCount = 0;
        // 訪問キャッシュを削除
        const visitKey = QueryCacheManager.generateVisitKey({ url });
        if (await this.store.delete(visitKey)) {
            deletedCount++;
        }
        // URL関連の検索キャッシュを検索・削除
        const entries = await this.store.query({ source: 'visit' });
        for (const entry of entries) {
            if (entry.key.includes(url)) {
                await this.store.delete(entry.key);
                deletedCount++;
            }
        }
        return deletedCount;
    }
    /**
     * 特定のソースのキャッシュをすべて削除
     */
    async invalidateBySource(source) {
        const entries = await this.store.query({ source });
        let deletedCount = 0;
        for (const entry of entries) {
            if (await this.store.delete(entry.key)) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
    /**
     * すべてのキャッシュをクリア
     */
    async clear() {
        await this.store.clear();
    }
    /**
     * 統計情報を取得
     */
    async getStats() {
        return this.store.getStats();
    }
    /**
     * 期限切れエントリを削除
     */
    async evictExpired() {
        return this.store.evictExpired();
    }
    /**
     * キャッシュサマリーを取得（ログ用）
     */
    async getSummary() {
        const stats = await this.getStats();
        const hitRatePercent = (stats.hitRate * 100).toFixed(1);
        const sizeMB = (stats.totalSizeBytes / (1024 * 1024)).toFixed(2);
        return [
            `Cache Summary:`,
            `  Entries: ${stats.totalEntries}`,
            `  Size: ${sizeMB} MB`,
            `  Hit Rate: ${hitRatePercent}%`,
            `  Hits: ${stats.hits}, Misses: ${stats.misses}`,
            `  Evictions: ${stats.expiredEvictions} (expired), ${stats.lruEvictions} (LRU)`,
        ].join('\n');
    }
    /**
     * ストアインスタンスを取得（テスト用）
     */
    getStore() {
        return this.store;
    }
}
/**
 * シングルトンインスタンス
 */
let defaultManager = null;
/**
 * デフォルトのキャッシュマネージャーを取得
 */
export function getDefaultCacheManager(config) {
    if (!defaultManager) {
        defaultManager = new QueryCacheManager(config);
    }
    return defaultManager;
}
/**
 * キャッシュマネージャーを作成
 */
export function createCacheManager(config) {
    return new QueryCacheManager(config);
}
//# sourceMappingURL=manager.js.map