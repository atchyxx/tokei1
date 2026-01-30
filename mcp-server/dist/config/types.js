/**
 * SHIKIGAMI Configuration Types
 *
 * REQ-NF-007: プロバイダー設定ファイル対応
 * REQ-SRCH-001: 検索フォールバック機構（v1.5.0）
 * shikigami.config.yaml で設定をカスタマイズ可能
 */
/**
 * 検索設定がv1.5.0形式かどうかを判定
 */
export function isSearchConfig(config) {
    return config !== undefined && 'providers' in config && Array.isArray(config.providers);
}
/**
 * 検索設定がv1.4.0以前の形式かどうかを判定
 */
export function isLegacySearchConfig(config) {
    return config !== undefined && 'provider' in config && typeof config.provider === 'string';
}
/**
 * デフォルト設定
 */
export const DEFAULT_CONFIG = {
    version: '1.0',
    search: {
        providers: [
            {
                name: 'duckduckgo',
                priority: 1,
                enabled: true,
                options: {
                    maxRetries: 2,
                    rateLimitMs: 1500,
                },
            },
        ],
        fallback: {
            enabled: true,
            maxRetries: 2,
        },
        options: {
            timeout: 30000,
            rateLimitMs: 1500,
        },
    },
    pageFetcher: {
        provider: 'jina',
        options: {
            rateLimitMs: 1000,
            timeout: 30000,
            format: 'markdown',
        },
    },
    cache: {
        enabled: true,
        ttlSeconds: 3600,
        maxSize: 1000,
        storage: 'memory',
    },
    log: {
        level: 'info',
        output: 'stderr',
    },
};
// ============================================================
// v1.7.0: デフォルト設定定数
// ============================================================
/**
 * デフォルト検索リカバリー設定
 */
export const DEFAULT_SEARCH_RECOVERY_CONFIG = {
    enabled: true,
    maxRetries: 3,
    timeoutMs: 30000,
    strategies: {
        synonym: { enabled: true },
        simplify: { enabled: true, maxWords: 3 },
        translate: { enabled: true },
    },
};
/**
 * デフォルトナレッジ連携設定
 */
export const DEFAULT_KNOWLEDGE_DISCOVERY_CONFIG = {
    enabled: true,
    searchPath: 'projects/',
    similarityThreshold: 0.3,
    maxResults: 5,
    freshnessWarningDays: 30,
    indexFileName: '.shikigami-index.json',
};
/**
 * デフォルトPDF解析設定
 */
export const DEFAULT_PDF_PARSING_CONFIG = {
    enabled: true,
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    maxPages: 50,
    timeoutMs: 60000,
    tempDir: '/tmp/shikigami-pdf',
};
/**
 * デフォルト多言語検索設定
 */
export const DEFAULT_MULTILINGUAL_SEARCH_CONFIG = {
    enabled: true,
    priorityLanguage: 'ja',
    maxResults: 20,
    timeoutMs: 10000,
    customDictionary: {},
};
/**
 * デフォルトナレッジ継承設定
 */
export const DEFAULT_KNOWLEDGE_INHERITANCE_CONFIG = {
    enabled: true,
    freshnessThresholdDays: 30,
    autoDetectRelated: true,
    includePatterns: ['research/**/*.md', 'reports/**/*.md'],
    excludePatterns: ['**/draft-*.md', '**/temp-*.md'],
};
/**
 * デフォルトページ訪問リカバリー設定
 */
export const DEFAULT_VISIT_RECOVERY_CONFIG = {
    enabled: true,
    maxRetries: 2,
    retryDelayMs: 1000,
    timeoutMs: 30000,
    enableWayback: true,
};
/**
 * デフォルトv1.15.0機能設定
 */
export const DEFAULT_V115_FEATURES_CONFIG = {
    domainDictionary: {
        enabled: true,
        domains: ['it', 'business', 'finance', 'legal', 'healthcare'],
        multilingualExpansion: true,
    },
    patentSearch: {
        enabled: true,
        defaultDatabase: 'J-PlatPat',
        autoClassification: true,
        synonymExpansion: true,
    },
    alternativeSources: {
        enabled: true,
        maxSuggestions: 3,
        maxResults: 5,
    },
    structuredExtraction: {
        enabled: true,
        extractImages: true,
        extractTables: true,
        outputFormat: 'json',
    },
    paywallDetection: {
        enabled: true,
        suggestAlternatives: true,
    },
    caseStudyExtractor: {
        enabled: true,
        minConfidence: 0.7,
    },
    skillSalaryExtractor: {
        enabled: true,
        currencies: ['JPY', 'USD'],
    },
    compositeFramework: {
        enabled: true,
        autoTriggerThreshold: 2,
    },
    geopoliticalRisk: {
        enabled: true,
        defaultRegions: ['china', 'us', 'eu', 'russia'],
    },
    scenarioAnalysis: {
        enabled: true,
        defaultTimeframes: [2025, 2030],
    },
    checklistGeneration: {
        enabled: true,
        defaultTypes: ['dd', 'verification', 'evaluation'],
    },
    supplyChainVisualization: {
        enabled: true,
        maxTiers: 3,
    },
};
//# sourceMappingURL=types.js.map