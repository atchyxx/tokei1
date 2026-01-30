/**
 * File Save Module
 * v1.28.0 - REQ-SHIKIGAMI-016: プロンプト・検索結果の永続化
 *
 * プロンプトをprompts/に、検索結果をresearch/に保存する機能
 * v1.28.0: すべてのユーザー入力（回答・指示・フィードバック）を保存
 */
export interface SaveResult {
    success: boolean;
    filePath: string;
    message: string;
    timestamp: string;
}
export interface SavePromptOptions {
    filename?: string;
    type: 'original' | 'structured' | 'refinement' | 'answer' | 'instruction' | 'feedback' | 'approval';
    version?: number;
    phase?: string;
    sequence?: number;
    context?: string;
    metadata?: Record<string, unknown>;
}
export interface SaveResearchOptions {
    filename?: string;
    query?: string;
    source?: 'search' | 'visit' | 'manual';
    metadata?: Record<string, unknown>;
}
/**
 * プロンプトを保存
 */
export declare function savePrompt(content: string, options: SavePromptOptions): Promise<SaveResult>;
/**
 * 検索結果を保存
 */
export declare function saveResearch(content: string, options: SaveResearchOptions): Promise<SaveResult>;
/**
 * 検索結果をJSON形式で保存
 */
export declare function saveResearchJson(data: unknown, options: SaveResearchOptions): Promise<SaveResult>;
/**
 * 汎用ファイル保存（指定ディレクトリに保存）
 */
export declare function saveToProject(content: string, subdir: 'prompts' | 'research' | 'reports', filename: string): Promise<SaveResult>;
//# sourceMappingURL=save.d.ts.map