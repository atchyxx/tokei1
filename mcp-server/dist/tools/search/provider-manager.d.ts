/**
 * Search Provider Manager
 *
 * REQ-SRCH-001: 検索フォールバック機構
 * プロバイダーの初期化と管理を担当
 */
import type { SearchConfig, SearchProviderConfig } from '../../config/types.js';
import type { SearchProvider, ProviderHealthStatus } from './providers/types.js';
/**
 * 検索プロバイダーマネージャー
 */
export declare class SearchProviderManager {
    private providers;
    private sortedProviders;
    constructor(config: SearchConfig);
    /**
     * 設定からプロバイダーを初期化
     */
    private initializeProviders;
    /**
     * priority順でプロバイダーを取得
     */
    getProvidersByPriority(): SearchProvider[];
    /**
     * 利用可能なプロバイダーのみを取得
     */
    getAvailableProviders(): Promise<SearchProvider[]>;
    /**
     * 特定のプロバイダーを取得
     */
    getProvider(name: string): SearchProvider | undefined;
    /**
     * 全プロバイダーのヘルスステータスを取得
     */
    getAllHealthStatus(): ProviderHealthStatus[];
    /**
     * プロバイダー数を取得
     */
    get count(): number;
}
/**
 * レガシー設定（v1.4.0以前）を新形式に変換
 */
export declare function convertLegacySearchConfig(config: SearchProviderConfig): SearchConfig;
//# sourceMappingURL=provider-manager.d.ts.map