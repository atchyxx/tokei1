/**
 * NumericDataExtractor - 数値データ自動抽出
 *
 * REQ-DATA-001: 数値データ自動抽出・整理
 * DES-SHIKIGAMI-014 Section 3.5
 * TSK-TS-005
 *
 * @version 1.14.0
 */
/**
 * 抽出された数値データ
 */
export interface NumericData {
    /** 元のテキスト */
    originalText: string;
    /** 抽出された値 */
    value: number;
    /** 単位（正規化済み） */
    unit: string;
    /** データタイプ */
    type: 'currency' | 'percentage' | 'count' | 'date' | 'measurement' | 'ratio';
    /** 通貨コード（currency の場合） */
    currency?: string;
    /** 信頼度（0-1） */
    confidence: number;
    /** コンテキスト（前後の文脈） */
    context?: string;
    /** 位置情報 */
    position?: {
        start: number;
        end: number;
    };
}
/**
 * 抽出オプション
 */
export interface ExtractionOptions {
    /** 抽出するタイプ */
    types?: NumericData['type'][];
    /** 最小信頼度 */
    minConfidence?: number;
    /** コンテキストを含めるか */
    includeContext?: boolean;
    /** コンテキストの文字数 */
    contextLength?: number;
}
/**
 * デフォルトオプション
 */
export declare const DEFAULT_EXTRACTION_OPTIONS: Required<ExtractionOptions>;
/**
 * テキストから数値データを抽出
 */
export declare function extractNumericData(text: string, options?: ExtractionOptions): NumericData[];
/**
 * NumericDataExtractor - 数値データ抽出クラス
 */
export declare class NumericDataExtractor {
    private readonly options;
    constructor(options?: ExtractionOptions);
    /**
     * テキストから数値データを抽出
     */
    extract(text: string): NumericData[];
    /**
     * オプションを取得
     */
    getOptions(): Required<ExtractionOptions>;
    /**
     * 通貨のみを抽出
     */
    extractCurrency(text: string): NumericData[];
    /**
     * 割合のみを抽出
     */
    extractPercentages(text: string): NumericData[];
    /**
     * 日付のみを抽出
     */
    extractDates(text: string): NumericData[];
    /**
     * 抽出結果のサマリーを生成
     */
    generateSummary(results: NumericData[]): {
        total: number;
        byType: Record<NumericData['type'], number>;
        currencies: {
            currency: string;
            total: number;
        }[];
        dateRange?: {
            earliest: Date;
            latest: Date;
        };
    };
}
//# sourceMappingURL=numeric-extractor.d.ts.map