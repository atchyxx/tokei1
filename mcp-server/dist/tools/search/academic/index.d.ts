/**
 * AcademicSearchAdapter - 学術文献検索モード
 *
 * REQ-ACAD-001: 学術文献検索モード
 * DES-SHIKIGAMI-014 Section 3.4
 * TSK-TS-004
 *
 * @version 1.14.0
 */
/**
 * 学術検索オプション
 */
export interface AcademicSearchOptions {
    /** 検索対象ソース */
    sources?: ('pubmed' | 'google_scholar' | 'semantic_scholar')[];
    /** 言語 */
    language?: 'en' | 'ja';
    /** 発行年範囲 */
    yearRange?: {
        from?: number;
        to?: number;
    };
    /** MeSH用語への変換を有効化 */
    enableMeshConversion?: boolean;
    /** 最大結果数 */
    maxResults?: number;
}
/**
 * デフォルトオプション
 */
export declare const DEFAULT_ACADEMIC_OPTIONS: Required<AcademicSearchOptions>;
/**
 * MeSH用語辞書（一般用語 → MeSH用語）
 */
export declare const MESH_DICTIONARY: Record<string, string[]>;
/**
 * 学術クエリ結果
 */
export interface AcademicQueryResult {
    /** 元のクエリ */
    originalQuery: string;
    /** 変換されたクエリ */
    convertedQuery: string;
    /** MeSH用語（変換された場合） */
    meshTerms?: string[];
    /** ソース別クエリ */
    sourceQueries: {
        pubmed?: string;
        googleScholar?: string;
        semanticScholar?: string;
    };
    /** ソース別URL */
    sourceUrls: {
        pubmed?: string;
        googleScholar?: string;
        semanticScholar?: string;
    };
}
/**
 * 一般用語をMeSH用語に変換
 */
export declare function convertToMeSH(query: string): {
    meshTerms: string[];
    unmatchedTerms: string[];
};
/**
 * 学術検索用にクエリをフォーマット
 */
export declare function formatAcademicQuery(query: string, options?: AcademicSearchOptions): AcademicQueryResult;
/**
 * 検索クエリが学術的かどうかを判定
 */
export declare function isAcademicQuery(query: string): boolean;
/**
 * AcademicSearchAdapter - 学術検索アダプター
 */
export declare class AcademicSearchAdapter {
    private readonly options;
    constructor(options?: AcademicSearchOptions);
    /**
     * クエリを学術検索用に変換
     */
    formatQuery(query: string): AcademicQueryResult;
    /**
     * MeSH用語に変換
     */
    convertToMeSH(query: string): ReturnType<typeof convertToMeSH>;
    /**
     * 学術クエリかどうかを判定
     */
    isAcademicQuery(query: string): boolean;
    /**
     * オプションを取得
     */
    getOptions(): Required<AcademicSearchOptions>;
    /**
     * 年範囲を設定
     */
    setYearRange(from?: number, to?: number): void;
    /**
     * MeSH辞書に用語を追加
     */
    static addMeshTerm(term: string, meshTerms: string[]): void;
    /**
     * MeSH辞書を取得
     */
    static getMeshDictionary(): Record<string, string[]>;
}
//# sourceMappingURL=index.d.ts.map