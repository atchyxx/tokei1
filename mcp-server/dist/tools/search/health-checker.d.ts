/**
 * Search Health Checker
 *
 * REQ-WF-002: 検索結果の品質検証
 * 検索結果の妥当性を検証し、無効な結果を検出
 */
import type { SearchResult, SearchHealthCheckResult } from './providers/types.js';
import { SearchProviderManager } from './provider-manager.js';
/**
 * ヘルスチェッカー
 */
export declare class HealthChecker {
    private manager;
    constructor(manager: SearchProviderManager);
    /**
     * 全プロバイダーの健全性をチェック
     */
    checkAllProviders(): Promise<SearchHealthCheckResult>;
    /**
     * 検索結果の品質を検証
     */
    validateResults(results: SearchResult[], query: string): {
        valid: boolean;
        quality: number;
        issues: string[];
    };
    /**
     * 単一検索結果の品質指標を計算
     */
    private getResultQualityMetrics;
    /**
     * URLの妥当性を検証
     */
    private isValidUrl;
}
//# sourceMappingURL=health-checker.d.ts.map