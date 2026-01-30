/**
 * Query Cache Manager
 * v1.0.0 - REQ-CACHE-001-01
 *
 * 検索・訪問クエリのキャッシュ管理
 */
import { FileCacheStore } from './store.js';
import { CacheConfig, CacheResult, CacheStats, CacheSource, CacheSetOptions } from './types.js';
/**
 * 検索クエリのキャッシュキー生成パラメータ
 */
export interface SearchCacheKeyParams {
    query: string;
    engine?: string;
    options?: Record<string, unknown>;
}
/**
 * 訪問クエリのキャッシュキー生成パラメータ
 */
export interface VisitCacheKeyParams {
    url: string;
    options?: {
        extractImages?: boolean;
        extractLinks?: boolean;
    };
}
/**
 * 埋め込みキャッシュキー生成パラメータ
 */
export interface EmbeddingCacheKeyParams {
    text: string;
    model?: string;
}
/**
 * キャッシュマネージャー設定
 */
export interface QueryCacheManagerConfig extends Partial<CacheConfig> {
    /** 自動期限切れ削除の間隔 (秒) */
    evictionIntervalSeconds?: number;
    /** 統計保存の間隔 (秒) */
    statsSaveIntervalSeconds?: number;
}
/**
 * クエリキャッシュマネージャー
 * 検索、訪問、埋め込みなどのクエリ結果をキャッシュ
 */
export declare class QueryCacheManager {
    private store;
    private config;
    private evictionTimer?;
    private statsSaveTimer?;
    constructor(config?: QueryCacheManagerConfig);
    /**
     * 定期的なメンテナンスタスクを開始
     */
    startMaintenanceTasks(): void;
    /**
     * メンテナンスタスクを停止
     */
    stopMaintenanceTasks(): void;
    /**
     * 検索クエリのキャッシュキーを生成
     */
    static generateSearchKey(params: SearchCacheKeyParams): string;
    /**
     * 訪問クエリのキャッシュキーを生成
     */
    static generateVisitKey(params: VisitCacheKeyParams): string;
    /**
     * 埋め込みキャッシュキーを生成
     */
    static generateEmbeddingKey(params: EmbeddingCacheKeyParams): string;
    /**
     * 検索結果をキャッシュから取得
     */
    getSearchResult<T = unknown>(params: SearchCacheKeyParams): Promise<CacheResult<T>>;
    /**
     * 検索結果をキャッシュに保存
     */
    setSearchResult<T = unknown>(params: SearchCacheKeyParams, value: T, options?: Omit<CacheSetOptions, 'source'>): Promise<void>;
    /**
     * 訪問結果をキャッシュから取得
     */
    getVisitResult<T = unknown>(params: VisitCacheKeyParams): Promise<CacheResult<T>>;
    /**
     * 訪問結果をキャッシュに保存
     */
    setVisitResult<T = unknown>(params: VisitCacheKeyParams, value: T, options?: Omit<CacheSetOptions, 'source'>): Promise<void>;
    /**
     * 埋め込みベクトルをキャッシュから取得
     */
    getEmbedding<T = unknown>(params: EmbeddingCacheKeyParams): Promise<CacheResult<T>>;
    /**
     * 埋め込みベクトルをキャッシュに保存
     */
    setEmbedding<T = unknown>(params: EmbeddingCacheKeyParams, value: T, options?: Omit<CacheSetOptions, 'source'>): Promise<void>;
    /**
     * 汎用的なキャッシュ取得
     */
    get<T = unknown>(key: string): Promise<CacheResult<T>>;
    /**
     * 汎用的なキャッシュ保存
     */
    set<T = unknown>(key: string, value: T, options?: CacheSetOptions): Promise<void>;
    /**
     * キャッシュエントリを削除
     */
    delete(key: string): Promise<boolean>;
    /**
     * URLに関連するキャッシュを削除
     */
    invalidateUrl(url: string): Promise<number>;
    /**
     * 特定のソースのキャッシュをすべて削除
     */
    invalidateBySource(source: CacheSource): Promise<number>;
    /**
     * すべてのキャッシュをクリア
     */
    clear(): Promise<void>;
    /**
     * 統計情報を取得
     */
    getStats(): Promise<CacheStats>;
    /**
     * 期限切れエントリを削除
     */
    evictExpired(): Promise<number>;
    /**
     * キャッシュサマリーを取得（ログ用）
     */
    getSummary(): Promise<string>;
    /**
     * ストアインスタンスを取得（テスト用）
     */
    getStore(): FileCacheStore;
}
/**
 * デフォルトのキャッシュマネージャーを取得
 */
export declare function getDefaultCacheManager(config?: QueryCacheManagerConfig): QueryCacheManager;
/**
 * キャッシュマネージャーを作成
 */
export declare function createCacheManager(config?: QueryCacheManagerConfig): QueryCacheManager;
//# sourceMappingURL=manager.d.ts.map