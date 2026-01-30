/**
 * SHIKIGAMI Configuration Loader
 *
 * REQ-NF-007: プロバイダー設定ファイル対応
 * REQ-SHIKIGAMI-015: v1.15.0機能設定対応
 * shikigami.config.yaml を読み込み、設定をマージ
 */
import { ShikigamiConfig, V115FeaturesConfig } from './types.js';
/**
 * 設定ファイルのパスを探索
 * @param searchPaths 探索するディレクトリパス（デフォルト: カレント、ホーム）
 * @returns 見つかった設定ファイルパス、または null
 */
export declare function findConfigFile(searchPaths?: string[]): string | null;
/**
 * YAML ファイルから設定を読み込み
 * @param filePath 設定ファイルパス
 * @returns パースされた設定
 */
export declare function loadConfigFile(filePath: string): Partial<ShikigamiConfig>;
/**
 * 環境変数から設定を上書き
 * SHIKIGAMI_* 形式の環境変数を読み込み
 */
export declare function loadEnvOverrides(): Partial<ShikigamiConfig>;
/**
 * 設定を読み込む（ファイル + 環境変数）
 * 優先順位: 環境変数 > 設定ファイル > デフォルト
 *
 * @param configPath 明示的な設定ファイルパス（省略時は自動探索）
 * @returns マージされた設定
 */
export declare function loadConfig(configPath?: string): ShikigamiConfig;
/**
 * グローバル設定を取得
 * 初回呼び出し時に設定をロード
 */
export declare function getConfig(): ShikigamiConfig;
/**
 * グローバル設定をリセット（テスト用）
 */
export declare function resetConfig(): void;
/**
 * v1.15.0 機能設定を取得
 * デフォルト値が適用された完全な設定を返す
 */
export declare function getV115FeaturesConfig(): V115FeaturesConfig;
/**
 * 特定のv1.15.0機能が有効かどうかを判定
 */
export declare function isV115FeatureEnabled(feature: keyof V115FeaturesConfig): boolean;
export * from './types.js';
//# sourceMappingURL=loader.d.ts.map