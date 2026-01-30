/**
 * Global Cache Store
 * v1.0.0 - REQ-CACHE-001-03
 *
 * ユーザー横断のグローバルキャッシュを管理
 * ~/.shikigami/global-cache/ に保存
 */
import { FileCacheStore } from './store.js';
import { CacheConfig, CacheStats, CacheSetOptions, CacheResult } from './types.js';
/**
 * グローバルキャッシュ設定
 */
export interface GlobalCacheConfig extends Partial<CacheConfig> {
    /** グローバルキャッシュの有効化 */
    enabled: boolean;
    /** プロジェクト固有キャッシュを優先するか */
    preferProjectCache: boolean;
    /** グローバルキャッシュのベースディレクトリ（デフォルト: ~/.shikigami） */
    baseDir?: string;
}
/**
 * デフォルトグローバルキャッシュ設定
 */
export declare const DEFAULT_GLOBAL_CACHE_CONFIG: GlobalCacheConfig;
/**
 * キャッシュスコープ
 */
export type CacheScope = 'global' | 'project';
/**
 * スコープ付きキャッシュ結果
 */
export interface ScopedCacheResult<T = unknown> extends CacheResult<T> {
    /** キャッシュが見つかったスコープ */
    scope?: CacheScope;
}
/**
 * GlobalCacheStore
 * ユーザー横断のグローバルキャッシュを管理
 */
export declare class GlobalCacheStore {
    private globalStore;
    private projectStore;
    private config;
    private globalCacheDir;
    constructor(config?: Partial<GlobalCacheConfig>);
    /**
     * プロジェクト固有のキャッシュストアを設定
     */
    setProjectStore(projectCacheDir: string): void;
    /**
     * プロジェクトストアをクリア
     */
    clearProjectStore(): void;
    /**
     * キャッシュエントリを取得（スコープ優先順位に従う）
     */
    get<T = unknown>(key: string): Promise<ScopedCacheResult<T>>;
    /**
     * キャッシュエントリを保存
     */
    set<T = unknown>(key: string, value: T, options?: CacheSetOptions & {
        scope?: CacheScope;
    }): Promise<void>;
    /**
     * キャッシュエントリを削除
     */
    delete(key: string, scope?: CacheScope): Promise<boolean>;
    /**
     * キャッシュの存在確認
     */
    has(key: string): Promise<{
        exists: boolean;
        scope?: CacheScope;
    }>;
    /**
     * 全エントリを削除
     */
    clear(scope?: CacheScope): Promise<void>;
    /**
     * 統計情報を取得
     */
    getStats(scope?: CacheScope): Promise<{
        global?: CacheStats;
        project?: CacheStats;
        combined?: {
            totalEntries: number;
            totalSizeBytes: number;
            globalHitRate: number;
            projectHitRate: number;
        };
    }>;
    /**
     * 期限切れエントリを削除
     */
    evictExpired(scope?: CacheScope): Promise<{
        global: number;
        project: number;
    }>;
    /**
     * グローバルキャッシュディレクトリを取得
     */
    getGlobalCacheDir(): string;
    /**
     * 設定を取得
     */
    getConfig(): GlobalCacheConfig;
    /**
     * グローバルキャッシュの有効/無効を切り替え
     */
    setEnabled(enabled: boolean): void;
    /**
     * プロジェクトキャッシュ優先設定を変更
     */
    setPreferProjectCache(prefer: boolean): void;
    /**
     * プロジェクトストアが設定されているか確認
     */
    hasProjectStore(): boolean;
    /**
     * 基盤となるストアを取得
     */
    getGlobalStore(): FileCacheStore;
    /**
     * プロジェクトストアを取得
     */
    getProjectStore(): FileCacheStore | null;
}
/**
 * デフォルトのグローバルキャッシュインスタンスを取得
 */
export declare function getGlobalCacheStore(config?: Partial<GlobalCacheConfig>): GlobalCacheStore;
/**
 * グローバルキャッシュインスタンスをリセット（テスト用）
 */
export declare function resetGlobalCacheStore(): void;
/**
 * グローバルキャッシュストアを作成
 */
export declare function createGlobalCacheStore(config?: Partial<GlobalCacheConfig>): GlobalCacheStore;
//# sourceMappingURL=global.d.ts.map