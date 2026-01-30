/**
 * Keyword Detection Utility
 *
 * v1.15.0: 共通キーワード検出ユーティリティ
 * REQ-SHIKIGAMI-015: ワークフロー統合のためのキーワードベース分岐制御
 */
/**
 * 分析タイプ
 */
export type AnalysisType = 'case-study' | 'skill-salary' | 'geopolitical' | 'scenario' | 'supply-chain' | 'patent' | 'dd-checklist';
/**
 * ドメインタイプ
 */
export type DomainType = 'it' | 'business' | 'finance' | 'legal' | 'healthcare';
/**
 * テキストにキーワードが含まれるかチェック
 * @param text 検索対象テキスト
 * @param keywords キーワードリスト
 * @returns いずれかのキーワードが含まれていればtrue
 */
export declare function containsKeywords(text: string, keywords: string[]): boolean;
/**
 * テキストからドメインを検出
 * @param text 検索対象テキスト
 * @returns 検出されたドメイン、または null
 */
export declare function detectDomainFromKeywords(text: string): DomainType | null;
/**
 * テキストから分析タイプを検出
 * @param text 検索対象テキスト（通常は goal パラメータ）
 * @returns 検出された分析タイプの配列
 */
export declare function detectAnalysisType(text: string): AnalysisType[];
/**
 * ケーススタディ関連のキーワードを含むかチェック
 * @param goal 目的文字列
 */
export declare function containsCaseStudyKeywords(goal: string): boolean;
/**
 * スキル・給与関連のキーワードを含むかチェック
 * @param goal 目的文字列
 */
export declare function containsSkillKeywords(goal: string): boolean;
/**
 * 地政学関連のキーワードを含むかチェック
 * @param text テキスト
 */
export declare function containsGeopoliticalKeywords(text: string): boolean;
/**
 * シナリオ分析関連のキーワードを含むかチェック
 * @param text テキスト
 */
export declare function containsScenarioKeywords(text: string): boolean;
/**
 * サプライチェーン関連のキーワードを含むかチェック
 * @param text テキスト
 */
export declare function containsSupplyChainKeywords(text: string): boolean;
/**
 * 特許関連のキーワードを含むかチェック
 * @param text テキスト
 */
export declare function containsPatentKeywords(text: string): boolean;
/**
 * DD/チェックリスト関連のキーワードを含むかチェック
 * @param text テキスト
 */
export declare function containsDDKeywords(text: string): boolean;
//# sourceMappingURL=keyword-detector.d.ts.map