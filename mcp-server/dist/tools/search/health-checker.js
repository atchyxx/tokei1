/**
 * Search Health Checker
 *
 * REQ-WF-002: 検索結果の品質検証
 * 検索結果の妥当性を検証し、無効な結果を検出
 */
/**
 * ヘルスチェッカー
 */
export class HealthChecker {
    manager;
    constructor(manager) {
        this.manager = manager;
    }
    /**
     * 全プロバイダーの健全性をチェック
     */
    async checkAllProviders() {
        const providers = this.manager.getProvidersByPriority();
        const statuses = [];
        for (const provider of providers) {
            try {
                const status = await provider.getHealthStatus();
                statuses.push(status);
            }
            catch {
                statuses.push({
                    name: provider.name,
                    available: false,
                    successRate: 0,
                    lastError: 'Failed to get health status',
                });
            }
        }
        const healthy = statuses.filter(s => s.available && s.successRate > 0.5);
        const degraded = statuses.filter(s => s.available && s.successRate <= 0.5);
        const unavailable = statuses.filter(s => !s.available);
        return {
            healthy: healthy.length,
            degraded: degraded.length,
            unavailable: unavailable.length,
            total: statuses.length,
            providers: statuses,
        };
    }
    /**
     * 検索結果の品質を検証
     */
    validateResults(results, query) {
        if (results.length === 0) {
            return {
                valid: false,
                quality: 0,
                issues: ['No search results returned'],
            };
        }
        const issues = [];
        const metrics = results.map(r => this.getResultQualityMetrics(r, query));
        // 平均品質スコア
        const avgQuality = metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length;
        // 各結果の問題を収集
        results.forEach((result, i) => {
            const m = metrics[i];
            if (!m.hasTitle)
                issues.push(`Result ${i + 1}: Missing title`);
            if (!m.hasValidUrl)
                issues.push(`Result ${i + 1}: Invalid URL`);
            if (!m.titleRelevance && !m.snippetRelevance) {
                issues.push(`Result ${i + 1}: Low relevance to query`);
            }
        });
        // 全体的な検証
        const validUrlRate = metrics.filter(m => m.hasValidUrl).length / results.length;
        if (validUrlRate < 0.5) {
            issues.push('More than half of URLs are invalid');
        }
        const relevantRate = metrics.filter(m => m.titleRelevance || m.snippetRelevance).length / results.length;
        if (relevantRate < 0.3) {
            issues.push('Less than 30% of results appear relevant');
        }
        return {
            valid: avgQuality >= 40 && validUrlRate >= 0.5,
            quality: Math.round(avgQuality),
            issues,
        };
    }
    /**
     * 単一検索結果の品質指標を計算
     */
    getResultQualityMetrics(result, query) {
        const hasTitle = result.title.trim().length > 0;
        const hasValidUrl = this.isValidUrl(result.url);
        const hasSnippet = result.snippet.trim().length > 0;
        const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const titleRelevance = queryWords.some(word => result.title.toLowerCase().includes(word));
        const snippetRelevance = queryWords.some(word => result.snippet.toLowerCase().includes(word));
        // スコア計算
        let score = 0;
        if (hasTitle)
            score += 20;
        if (hasValidUrl)
            score += 30;
        if (hasSnippet)
            score += 20;
        if (titleRelevance)
            score += 15;
        if (snippetRelevance)
            score += 15;
        return {
            hasTitle,
            hasValidUrl,
            hasSnippet,
            titleRelevance,
            snippetRelevance,
            score,
        };
    }
    /**
     * URLの妥当性を検証
     */
    isValidUrl(url) {
        try {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=health-checker.js.map