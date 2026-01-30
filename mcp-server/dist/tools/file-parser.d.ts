/**
 * File Parser Tool
 *
 * Implements REQ-DR-003: ファイル入力
 * Implements REQ-CS-003: コード/ドキュメント解析
 * Implements REQ-NUMERIC-001: 数値データ抽出 (v1.14.0)
 *
 * Supports:
 * - PDF (via pdf-parse or external API)
 * - Text files (txt, md, json, yaml, csv)
 * - Code files (ts, js, py, etc.)
 * - Numeric data extraction (currencies, percentages, dates, etc.)
 *
 * Note: For advanced parsing (complex PDF, Excel), use docling or external API
 */
import { type NumericData } from './file-parser/numeric-extractor.js';
/**
 * v1.14.0: 数値データサマリー
 */
export interface NumericDataSummary {
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
}
export interface ParsedFile {
    /** ファイルパス */
    filePath: string;
    /** ファイル名 */
    fileName: string;
    /** 拡張子 */
    extension: string;
    /** MIMEタイプ */
    mimeType: string;
    /** 抽出されたテキスト */
    content: string;
    /** メタデータ */
    metadata: FileMetadata;
    /** エラー（あれば） */
    error?: string;
    /** v1.14.0: 数値データサマリー（オプション） */
    numericData?: NumericDataSummary;
}
export interface FileMetadata {
    /** ファイルサイズ（bytes） */
    size: number;
    /** 最終更新日時 */
    modifiedAt: string;
    /** 行数（テキストファイルの場合） */
    lineCount?: number;
    /** 文字数 */
    charCount?: number;
    /** 言語（コードファイルの場合） */
    language?: string;
}
/**
 * ファイルを解析してテキストを抽出
 * @param filePath ファイルパス
 * @param options オプション
 * @param options.extractNumeric 数値データを抽出するかどうか (v1.14.0)
 */
export declare function parseFile(filePath: string, options?: {
    extractNumeric?: boolean;
}): Promise<ParsedFile>;
/**
 * 複数ファイルを解析
 */
export declare function parseFiles(filePaths: string[]): Promise<ParsedFile[]>;
/**
 * ディレクトリ内のファイルを再帰的に解析
 */
export declare function parseDirectory(dirPath: string, options?: {
    /** 解析する拡張子（指定しない場合は全て） */
    extensions?: string[];
    /** 除外パターン（glob形式ではなく、パスに含まれる文字列） */
    exclude?: string[];
    /** 最大ファイル数 */
    maxFiles?: number;
}): Promise<ParsedFile[]>;
//# sourceMappingURL=file-parser.d.ts.map