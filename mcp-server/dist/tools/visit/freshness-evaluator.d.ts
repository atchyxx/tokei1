/**
 * FreshnessEvaluator - コンテンツ鮮度評価
 *
 * REQ-FRESH-001: 情報鮮度自動評価
 * DES-SHIKIGAMI-014 Section 3.6
 * TSK-TS-006
 *
 * @version 1.14.0
 */
/**
 * 鮮度レベル
 */
export type FreshnessLevel = 'fresh' | 'recent' | 'stale' | 'outdated' | 'unknown';
/**
 * 鮮度評価結果
 */
export interface FreshnessResult {
    /** 鮮度レベル */
    level: FreshnessLevel;
    /** 公開日（検出できた場合） */
    publishDate?: Date;
    /** 更新日（検出できた場合） */
    updateDate?: Date;
    /** 信頼度（0-1） */
    confidence: number;
    /** 経過日数 */
    daysOld?: number;
    /** 鮮度スコア（0-100） */
    score: number;
    /** 検出方法 */
    detectionMethod?: string;
    /** 警告メッセージ */
    warnings?: string[];
    /** メタデータ */
    metadata?: {
        source: string;
        rawDate?: string;
    };
}
/**
 * 鮮度評価オプション
 */
export interface FreshnessOptions {
    /** 「fresh」とみなす日数閾値 */
    freshThresholdDays?: number;
    /** 「recent」とみなす日数閾値 */
    recentThresholdDays?: number;
    /** 「stale」とみなす日数閾値 */
    staleThresholdDays?: number;
    /** 基準日（デフォルト: 現在） */
    referenceDate?: Date;
    /** トピック別の閾値を使用するか */
    topicAware?: boolean;
}
/**
 * デフォルトオプション
 */
export declare const DEFAULT_FRESHNESS_OPTIONS: Required<FreshnessOptions>;
/**
 * トピック別の鮮度閾値
 */
export declare const TOPIC_FRESHNESS_THRESHOLDS: Record<string, {
    fresh: number;
    recent: number;
    stale: number;
}>;
/**
 * HTMLから日付を抽出
 */
export declare function extractDateFromHTML(html: string): {
    publishDate?: Date;
    updateDate?: Date;
    confidence: number;
    method: string;
};
/**
 * テキストから日付を抽出
 */
export declare function extractDateFromText(text: string): {
    date: Date;
    rawText: string;
} | null;
/**
 * 鮮度レベルを計算
 */
export declare function calculateFreshnessLevel(daysOld: number, options: Required<FreshnessOptions>): FreshnessLevel;
/**
 * 鮮度スコアを計算（0-100）
 */
export declare function calculateFreshnessScore(daysOld: number, options: Required<FreshnessOptions>): number;
/**
 * 鮮度を評価
 */
export declare function evaluateFreshness(content: string, options?: FreshnessOptions): FreshnessResult;
/**
 * FreshnessEvaluator - 鮮度評価クラス
 */
export declare class FreshnessEvaluator {
    private readonly options;
    constructor(options?: FreshnessOptions);
    /**
     * 鮮度を評価
     */
    evaluate(content: string): FreshnessResult;
    /**
     * トピックに基づいた鮮度評価
     */
    evaluateWithTopic(content: string, topic: string): FreshnessResult;
    /**
     * オプションを取得
     */
    getOptions(): Required<FreshnessOptions>;
    /**
     * 利用可能なトピック一覧を取得
     */
    static getAvailableTopics(): string[];
    /**
     * トピックの閾値を取得
     */
    static getTopicThresholds(topic: string): {
        fresh: number;
        recent: number;
        stale: number;
    } | undefined;
    /**
     * 鮮度レベルの説明を取得
     */
    static getLevelDescription(level: FreshnessLevel): string;
    /**
     * 鮮度レベルの絵文字を取得
     */
    static getLevelEmoji(level: FreshnessLevel): string;
    /**
     * 鮮度結果をフォーマット
     */
    formatResult(result: FreshnessResult): string;
}
//# sourceMappingURL=freshness-evaluator.d.ts.map