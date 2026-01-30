/**
 * Search Fallback Handler
 *
 * REQ-SRCH-001: 検索フォールバック機構
 * プライマリプロバイダー失敗時に次のプロバイダーへフォールバック
 */
import type { SearchFallbackConfig } from '../../config/types.js';
import type { SearchWithFallbackResult } from './providers/types.js';
import { SearchProviderManager } from './provider-manager.js';
/**
 * フォールバックハンドラー
 */
export declare class FallbackHandler {
    private manager;
    private config;
    constructor(manager: SearchProviderManager, config: SearchFallbackConfig);
    /**
     * フォールバック付きで検索を実行
     */
    searchWithFallback(query: string, maxResults?: number): Promise<SearchWithFallbackResult>;
    /**
     * 単一プロバイダーで検索を試行
     */
    private tryProvider;
}
//# sourceMappingURL=fallback-handler.d.ts.map