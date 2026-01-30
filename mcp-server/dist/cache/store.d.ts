/**
 * File-based Cache Store Implementation
 * v1.0.0 - REQ-CACHE-001-01
 *
 * ファイルベースのキャッシュストア実装
 * LRU削除ポリシー、TTL管理対応
 */
import { ICacheStore, CacheEntry, CacheResult, CacheSetOptions, CacheQueryOptions, CacheStats, CacheConfig, CacheSource } from './types.js';
/**
 * デフォルトキャッシュ設定
 */
export declare const DEFAULT_CACHE_CONFIG: CacheConfig;
/**
 * ファイルベースキャッシュストア
 */
export declare class FileCacheStore implements ICacheStore {
    private config;
    private stats;
    private initialized;
    constructor(config?: Partial<CacheConfig>);
    /**
     * 統計情報を初期化
     */
    private initStats;
    /**
     * キャッシュディレクトリを初期化
     */
    private ensureInitialized;
    /**
     * キーからファイルパスを生成
     */
    private getFilePaths;
    /**
     * クエリからキャッシュキーを生成
     */
    static generateKey(query: string, source?: CacheSource): string;
    /**
     * クエリハッシュを生成
     */
    static generateQueryHash(query: string): string;
    /**
     * キャッシュエントリを取得
     */
    get<T = unknown>(key: string): Promise<CacheResult<T>>;
    /**
     * キャッシュエントリを保存
     */
    set<T = unknown>(key: string, value: T, options?: CacheSetOptions): Promise<void>;
    /**
     * キャッシュエントリを削除
     */
    delete(key: string): Promise<boolean>;
    /**
     * 全エントリを削除
     */
    clear(): Promise<void>;
    /**
     * キーが存在するか確認
     */
    has(key: string): Promise<boolean>;
    /**
     * 統計情報を取得
     */
    getStats(): Promise<CacheStats>;
    /**
     * 期限切れエントリを削除
     */
    evictExpired(): Promise<number>;
    /**
     * LRUポリシーでエントリを削除
     */
    evictLru(targetSizeBytes: number): Promise<number>;
    /**
     * エントリを検索
     */
    query(options: CacheQueryOptions): Promise<CacheEntry[]>;
    /**
     * ヒット率を更新
     */
    private updateHitRate;
    /**
     * ソース別統計を更新
     */
    private updateSourceStats;
    /**
     * 統計情報を読み込み
     */
    private loadStats;
    /**
     * 統計情報を保存
     */
    saveStats(): Promise<void>;
}
/**
 * デフォルトのキャッシュストアインスタンスを作成
 */
export declare function createCacheStore(config?: Partial<CacheConfig>): FileCacheStore;
//# sourceMappingURL=store.d.ts.map