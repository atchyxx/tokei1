/**
 * Direct Visit Strategy - Level 3 検索リカバリー戦略
 *
 * REQ-SRCH-010: 検索結果空時の自動フォールバック
 * REQ-SRCH-010-03: 代表URL直接訪問戦略
 * DES-SHIKIGAMI-014 Section 3.1
 * TSK-TS-001
 *
 * @version 1.14.0
 */
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
/**
 * DirectVisitStrategy - 代表URL直接訪問戦略
 *
 * 検索結果が空の場合、トピックに関連する代表URLを直接訪問して情報を取得
 */
export class DirectVisitStrategy {
    name = 'direct_visit';
    priority = 3; // Level 3（最終手段）
    config = null;
    configPath;
    constructor(configPath) {
        this.configPath = configPath ?? path.join(process.cwd(), 'configs', 'topic-representative-urls.yaml');
        this.loadConfig();
    }
    /**
     * 設定ファイルを読み込み
     */
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const content = fs.readFileSync(this.configPath, 'utf-8');
                this.config = yaml.load(content);
            }
        }
        catch {
            console.error(`[DirectVisitStrategy] Failed to load config: ${this.configPath}`);
            this.config = null;
        }
    }
    /**
     * この戦略が適用可能かどうかを判定
     */
    isApplicable(query) {
        if (!this.config)
            return false;
        const matchedTopics = this.findMatchingTopics(query);
        return matchedTopics.length > 0;
    }
    /**
     * 代替クエリを生成（この戦略では訪問URLを返す）
     */
    generateAlternatives(query) {
        if (!this.config)
            return [];
        const matchedTopics = this.findMatchingTopics(query);
        if (matchedTopics.length === 0)
            return [];
        const alternatives = [];
        const priorityOrder = this.config.priority_order ?? ['official', 'wiki', 'market_research'];
        const maxUrls = this.config.max_urls ?? 3;
        // 優先順位に従ってURLを収集
        for (const topicKey of matchedTopics) {
            const topic = this.config.topics[topicKey];
            if (!topic?.urls)
                continue;
            // 優先順位でソート
            const sortedUrls = [...topic.urls].sort((a, b) => {
                const aIndex = priorityOrder.indexOf(a.type);
                const bIndex = priorityOrder.indexOf(b.type);
                return aIndex - bIndex;
            });
            for (const urlEntry of sortedUrls.slice(0, maxUrls)) {
                alternatives.push({
                    query: urlEntry.url, // URLを「クエリ」として返す
                    strategy: this.name,
                    confidence: this.calculateConfidence(urlEntry.type, priorityOrder),
                    description: `Direct visit to ${urlEntry.name} (${urlEntry.type}) for topic: ${topicKey}`,
                    metadata: {
                        topicKey,
                        urlType: urlEntry.type,
                        urlName: urlEntry.name,
                        isDirectVisit: true,
                    },
                });
            }
        }
        return alternatives.slice(0, maxUrls);
    }
    /**
     * クエリにマッチするトピックを検索
     */
    findMatchingTopics(query) {
        if (!this.config?.topics)
            return [];
        const queryLower = query.toLowerCase();
        const matchedTopics = [];
        for (const [topicKey, topic] of Object.entries(this.config.topics)) {
            const allKeywords = [
                ...(topic.keywords?.ja ?? []),
                ...(topic.keywords?.en ?? []),
            ];
            for (const keyword of allKeywords) {
                if (queryLower.includes(keyword.toLowerCase())) {
                    matchedTopics.push(topicKey);
                    break;
                }
            }
        }
        return matchedTopics;
    }
    /**
     * 代表URLを直接訪問してコンテンツを取得
     */
    async executeDirectVisit(query, visitFn) {
        if (!this.config) {
            return {
                success: false,
                query,
                visitedUrls: [],
                totalContent: '',
            };
        }
        const matchedTopics = this.findMatchingTopics(query);
        if (matchedTopics.length === 0) {
            return {
                success: false,
                query,
                visitedUrls: [],
                totalContent: '',
            };
        }
        const topicKey = matchedTopics[0];
        const topic = this.config.topics[topicKey];
        const visitedUrls = [];
        const contentParts = [];
        const maxUrls = this.config.max_urls ?? 3;
        const urlsToVisit = topic.urls.slice(0, maxUrls);
        for (const urlEntry of urlsToVisit) {
            try {
                const result = await visitFn(urlEntry.url);
                if (result.content && result.content.length > 100) {
                    visitedUrls.push({
                        url: urlEntry.url,
                        name: urlEntry.name,
                        type: urlEntry.type,
                        success: true,
                        contentLength: result.content.length,
                    });
                    contentParts.push(`## ${urlEntry.name}\n\n${result.content.slice(0, 2000)}`);
                }
                else {
                    visitedUrls.push({
                        url: urlEntry.url,
                        name: urlEntry.name,
                        type: urlEntry.type,
                        success: false,
                        contentLength: result.content?.length ?? 0,
                        error: 'Content too short',
                    });
                }
            }
            catch (error) {
                visitedUrls.push({
                    url: urlEntry.url,
                    name: urlEntry.name,
                    type: urlEntry.type,
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
        const successfulVisits = visitedUrls.filter((v) => v.success);
        return {
            success: successfulVisits.length > 0,
            query,
            matchedTopic: topicKey,
            visitedUrls,
            totalContent: contentParts.join('\n\n---\n\n'),
        };
    }
    /**
     * 信頼度を計算
     */
    calculateConfidence(urlType, priorityOrder) {
        const index = priorityOrder.indexOf(urlType);
        if (index === -1)
            return 0.5;
        // 優先度が高いほど信頼度が高い
        return Math.max(0.5, 0.9 - index * 0.15);
    }
    /**
     * 設定を取得
     */
    getConfig() {
        return this.config;
    }
    /**
     * 設定を再読み込み
     */
    reloadConfig() {
        this.loadConfig();
    }
}
//# sourceMappingURL=direct-visit.js.map