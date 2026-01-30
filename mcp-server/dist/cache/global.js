/**
 * Global Cache Store
 * v1.0.0 - REQ-CACHE-001-03
 *
 * ユーザー横断のグローバルキャッシュを管理
 * ~/.shikigami/global-cache/ に保存
 */
import * as os from 'os';
import * as path from 'path';
import { FileCacheStore } from './store.js';
/**
 * デフォルトグローバルキャッシュ設定
 */
export const DEFAULT_GLOBAL_CACHE_CONFIG = {
    enabled: true,
    preferProjectCache: true,
    maxEntries: 5000,
    defaultTtlSeconds: 3600 * 24 * 7, // 1週間
    maxSizeBytes: 500 * 1024 * 1024, // 500MB
};
/**
 * GlobalCacheStore
 * ユーザー横断のグローバルキャッシュを管理
 */
export class GlobalCacheStore {
    globalStore;
    projectStore = null;
    config;
    globalCacheDir;
    constructor(config = {}) {
        this.config = { ...DEFAULT_GLOBAL_CACHE_CONFIG, ...config };
        // グローバルキャッシュディレクトリを設定
        const baseDir = this.config.baseDir || path.join(os.homedir(), '.shikigami');
        this.globalCacheDir = path.join(baseDir, 'global-cache');
        // グローバルストアを初期化
        this.globalStore = new FileCacheStore({
            cacheDir: this.globalCacheDir,
            maxEntries: this.config.maxEntries,
            defaultTtlSeconds: this.config.defaultTtlSeconds,
            maxSizeBytes: this.config.maxSizeBytes,
        });
    }
    /**
     * プロジェクト固有のキャッシュストアを設定
     */
    setProjectStore(projectCacheDir) {
        this.projectStore = new FileCacheStore({
            cacheDir: projectCacheDir,
            maxEntries: this.config.maxEntries,
            defaultTtlSeconds: this.config.defaultTtlSeconds,
            maxSizeBytes: this.config.maxSizeBytes,
        });
    }
    /**
     * プロジェクトストアをクリア
     */
    clearProjectStore() {
        this.projectStore = null;
    }
    /**
     * キャッシュエントリを取得（スコープ優先順位に従う）
     */
    async get(key) {
        // プロジェクトキャッシュを優先する場合
        if (this.config.preferProjectCache && this.projectStore) {
            const projectResult = await this.projectStore.get(key);
            if (projectResult.hit) {
                return { ...projectResult, scope: 'project' };
            }
        }
        // グローバルキャッシュから取得
        if (this.config.enabled) {
            const globalResult = await this.globalStore.get(key);
            if (globalResult.hit) {
                return { ...globalResult, scope: 'global' };
            }
        }
        // プロジェクトキャッシュを後で確認（優先しない場合）
        if (!this.config.preferProjectCache && this.projectStore) {
            const projectResult = await this.projectStore.get(key);
            if (projectResult.hit) {
                return { ...projectResult, scope: 'project' };
            }
        }
        return { hit: false, key };
    }
    /**
     * キャッシュエントリを保存
     */
    async set(key, value, options = {}) {
        const { scope = 'global', ...cacheOptions } = options;
        if (scope === 'project' && this.projectStore) {
            await this.projectStore.set(key, value, cacheOptions);
        }
        else if (scope === 'global' && this.config.enabled) {
            await this.globalStore.set(key, value, cacheOptions);
        }
    }
    /**
     * キャッシュエントリを削除
     */
    async delete(key, scope) {
        let deleted = false;
        if (scope === 'project' || scope === undefined) {
            if (this.projectStore) {
                deleted = (await this.projectStore.delete(key)) || deleted;
            }
        }
        if (scope === 'global' || scope === undefined) {
            if (this.config.enabled) {
                deleted = (await this.globalStore.delete(key)) || deleted;
            }
        }
        return deleted;
    }
    /**
     * キャッシュの存在確認
     */
    async has(key) {
        if (this.config.preferProjectCache && this.projectStore) {
            if (await this.projectStore.has(key)) {
                return { exists: true, scope: 'project' };
            }
        }
        if (this.config.enabled && (await this.globalStore.has(key))) {
            return { exists: true, scope: 'global' };
        }
        if (!this.config.preferProjectCache && this.projectStore) {
            if (await this.projectStore.has(key)) {
                return { exists: true, scope: 'project' };
            }
        }
        return { exists: false };
    }
    /**
     * 全エントリを削除
     */
    async clear(scope) {
        if (scope === 'project' || scope === undefined) {
            if (this.projectStore) {
                await this.projectStore.clear();
            }
        }
        if (scope === 'global' || scope === undefined) {
            if (this.config.enabled) {
                await this.globalStore.clear();
            }
        }
    }
    /**
     * 統計情報を取得
     */
    async getStats(scope) {
        const result = {};
        if (scope === 'global' || scope === undefined) {
            if (this.config.enabled) {
                result.global = await this.globalStore.getStats();
            }
        }
        if (scope === 'project' || scope === undefined) {
            if (this.projectStore) {
                result.project = await this.projectStore.getStats();
            }
        }
        // 結合統計
        if (scope === undefined && result.global) {
            result.combined = {
                totalEntries: (result.global?.totalEntries || 0) + (result.project?.totalEntries || 0),
                totalSizeBytes: (result.global?.totalSizeBytes || 0) + (result.project?.totalSizeBytes || 0),
                globalHitRate: result.global?.hitRate || 0,
                projectHitRate: result.project?.hitRate || 0,
            };
        }
        return result;
    }
    /**
     * 期限切れエントリを削除
     */
    async evictExpired(scope) {
        let globalEvicted = 0;
        let projectEvicted = 0;
        if (scope === 'global' || scope === undefined) {
            if (this.config.enabled) {
                globalEvicted = await this.globalStore.evictExpired();
            }
        }
        if (scope === 'project' || scope === undefined) {
            if (this.projectStore) {
                projectEvicted = await this.projectStore.evictExpired();
            }
        }
        return { global: globalEvicted, project: projectEvicted };
    }
    /**
     * グローバルキャッシュディレクトリを取得
     */
    getGlobalCacheDir() {
        return this.globalCacheDir;
    }
    /**
     * 設定を取得
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * グローバルキャッシュの有効/無効を切り替え
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
    }
    /**
     * プロジェクトキャッシュ優先設定を変更
     */
    setPreferProjectCache(prefer) {
        this.config.preferProjectCache = prefer;
    }
    /**
     * プロジェクトストアが設定されているか確認
     */
    hasProjectStore() {
        return this.projectStore !== null;
    }
    /**
     * 基盤となるストアを取得
     */
    getGlobalStore() {
        return this.globalStore;
    }
    /**
     * プロジェクトストアを取得
     */
    getProjectStore() {
        return this.projectStore;
    }
}
// シングルトンインスタンス
let globalCacheInstance = null;
/**
 * デフォルトのグローバルキャッシュインスタンスを取得
 */
export function getGlobalCacheStore(config) {
    if (!globalCacheInstance) {
        globalCacheInstance = new GlobalCacheStore(config);
    }
    return globalCacheInstance;
}
/**
 * グローバルキャッシュインスタンスをリセット（テスト用）
 */
export function resetGlobalCacheStore() {
    globalCacheInstance = null;
}
/**
 * グローバルキャッシュストアを作成
 */
export function createGlobalCacheStore(config) {
    return new GlobalCacheStore(config);
}
//# sourceMappingURL=global.js.map