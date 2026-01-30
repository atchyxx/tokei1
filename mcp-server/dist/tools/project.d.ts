/**
 * Project Management Module
 * v1.23.0 - REQ-SHIKIGAMI-016: プロジェクトコンテキスト管理
 *
 * アクティブなプロジェクトディレクトリを管理し、
 * 他のツール（save_prompt, save_research）が使用するパスを提供
 */
interface ActiveProject {
    projectPath: string;
    projectId: string;
    projectName: string;
    promptsDir: string;
    researchDir: string;
    reportsDir: string;
    manifestPath: string;
}
/**
 * プロジェクトディレクトリが有効かどうか検証
 */
export declare function isValidProjectDirectory(projectPath: string): boolean;
/**
 * アクティブなプロジェクトを設定
 */
export declare function setActiveProject(projectPath: string): ActiveProject;
/**
 * 現在のアクティブなプロジェクトを取得
 */
export declare function getActiveProject(): ActiveProject | null;
/**
 * プロジェクトがアクティブかどうか確認
 */
export declare function hasActiveProject(): boolean;
/**
 * アクティブなプロジェクトをクリア
 */
export declare function clearActiveProject(): void;
/**
 * プロジェクトの特定ディレクトリパスを取得
 */
export declare function getProjectSubdirectory(subdir: 'prompts' | 'research' | 'reports'): string;
/**
 * プロジェクト情報をJSON形式で返す（MCPレスポンス用）
 */
export declare function getProjectInfo(): Record<string, unknown>;
/**
 * projects/ディレクトリから最新のプロジェクトを自動検出
 */
export declare function detectLatestProject(basePath?: string): string | null;
export {};
//# sourceMappingURL=project.d.ts.map