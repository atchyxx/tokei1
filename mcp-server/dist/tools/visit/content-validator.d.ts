/**
 * ContentValidator - 空コンテンツ検出・警告
 *
 * REQ-CONT-001: 空コンテンツ検出・警告
 * DES-SHIKIGAMI-014 Section 3.3
 * TSK-TS-003
 *
 * @version 1.14.0
 */
/**
 * コンテンツ検証設定
 */
export interface ContentValidationConfig {
    /** 最小文字数（これ未満は空とみなす、デフォルト: 100） */
    minLength?: number;
    /** 警告文字数（これ未満は警告、デフォルト: 500） */
    warningLength?: number;
    /** 意味のあるコンテンツの最小割合（0-1、デフォルト: 0.3） */
    minMeaningfulRatio?: number;
    /** ブロックリスト（これらの文字列のみの場合は空とみなす） */
    blocklist?: string[];
}
/**
 * デフォルト設定
 */
export declare const DEFAULT_CONTENT_VALIDATION_CONFIG: Required<ContentValidationConfig>;
/**
 * コンテンツ検証結果
 */
export interface ContentValidationResult {
    /** 有効なコンテンツかどうか */
    isValid: boolean;
    /** 警告があるかどうか */
    hasWarning: boolean;
    /** 検証ステータス */
    status: 'valid' | 'warning' | 'empty' | 'blocked' | 'too_short';
    /** コンテンツ長 */
    contentLength: number;
    /** 意味のある文字の割合 */
    meaningfulRatio: number;
    /** メッセージ */
    message: string;
    /** 詳細情報 */
    details?: {
        /** マッチしたブロックリスト項目 */
        matchedBlocklist?: string;
        /** 推定されるコンテンツタイプ */
        estimatedContentType?: 'html' | 'text' | 'json' | 'error_page' | 'login_page';
        /** 追加の警告 */
        additionalWarnings?: string[];
    };
}
/**
 * コンテンツを検証
 */
export declare function validateContent(content: string | undefined | null, config?: ContentValidationConfig): ContentValidationResult;
/**
 * 意味のある文字の割合を計算
 *
 * HTMLタグ、スクリプト、スタイル、空白を除いた文字の割合
 */
export declare function calculateMeaningfulRatio(content: string): number;
/**
 * コンテンツタイプを推定
 */
export declare function detectContentType(content: string): 'html' | 'text' | 'json' | 'error_page' | 'login_page';
/**
 * ContentValidator - コンテンツ検証を管理
 */
export declare class ContentValidator {
    private readonly config;
    constructor(config?: ContentValidationConfig);
    /**
     * コンテンツを検証
     */
    validate(content: string | undefined | null): ContentValidationResult;
    /**
     * 設定を取得
     */
    getConfig(): Required<ContentValidationConfig>;
    /**
     * ブロックリストに項目を追加
     */
    addBlocklistItem(item: string): void;
    /**
     * ブロックリストから項目を削除
     */
    removeBlocklistItem(item: string): void;
    /**
     * 複数のコンテンツを一括検証
     */
    validateAll(contents: (string | undefined | null)[]): ContentValidationResult[];
    /**
     * 検証サマリーを生成
     */
    generateSummary(results: ContentValidationResult[]): {
        total: number;
        valid: number;
        warning: number;
        invalid: number;
        validRate: number;
    };
}
//# sourceMappingURL=content-validator.d.ts.map