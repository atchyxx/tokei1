/**
 * エンコーディング処理 型定義
 *
 * @requirements REQ-VISIT-003, REQ-VISIT-003-01, REQ-VISIT-003-02
 * @design DES-VISIT-003
 * @version 1.11.0
 */
/**
 * デフォルト設定
 */
export const DEFAULT_ENCODING_CONFIG = {
    enableMojibakeDetection: true,
    enableAutoConversion: true,
    fallbackEncoding: 'utf-8',
    timeoutMs: 5000,
    verboseLogging: false,
};
/**
 * 文字化けパターン定義
 */
export const MOJIBAKE_PATTERNS = [
    // Shift_JIS → UTF-8 誤変換パターン
    {
        name: 'shift_jis_as_utf8_1',
        pattern: '縺',
        suggestedEncoding: 'shift_jis',
        fromEncoding: 'shift_jis',
        toEncoding: 'utf-8',
    },
    {
        name: 'shift_jis_as_utf8_2',
        pattern: '譁',
        suggestedEncoding: 'shift_jis',
        fromEncoding: 'shift_jis',
        toEncoding: 'utf-8',
    },
    {
        name: 'shift_jis_as_utf8_3',
        pattern: '繧',
        suggestedEncoding: 'shift_jis',
        fromEncoding: 'shift_jis',
        toEncoding: 'utf-8',
    },
    {
        name: 'shift_jis_as_utf8_4',
        pattern: '繝',
        suggestedEncoding: 'shift_jis',
        fromEncoding: 'shift_jis',
        toEncoding: 'utf-8',
    },
    {
        name: 'shift_jis_as_utf8_5',
        pattern: '蜀',
        suggestedEncoding: 'shift_jis',
        fromEncoding: 'shift_jis',
        toEncoding: 'utf-8',
    },
    // UTF-8 → Latin1 誤変換パターン
    {
        name: 'utf8_as_latin1_1',
        pattern: 'ã€',
        suggestedEncoding: 'utf-8',
        fromEncoding: 'utf-8',
        toEncoding: 'iso-8859-1',
    },
    {
        name: 'utf8_as_latin1_2',
        pattern: 'ã‚',
        suggestedEncoding: 'utf-8',
        fromEncoding: 'utf-8',
        toEncoding: 'iso-8859-1',
    },
    {
        name: 'utf8_as_latin1_3',
        pattern: 'ã',
        suggestedEncoding: 'utf-8',
        fromEncoding: 'utf-8',
        toEncoding: 'iso-8859-1',
    },
    // 置換文字（変換失敗の兆候）
    {
        name: 'replacement_character',
        pattern: '\uFFFD',
        suggestedEncoding: 'shift_jis',
        fromEncoding: 'unknown',
        toEncoding: 'utf-8',
    },
];
/**
 * BOMマッピング
 */
export const BOM_MAP = {
    '\xEF\xBB\xBF': 'utf-8',
    '\xFE\xFF': 'utf-8', // UTF-16BE（UTF-8として扱う）
    '\xFF\xFE': 'utf-8', // UTF-16LE（UTF-8として扱う）
};
/**
 * エンコーディング名のエイリアスマップ
 */
export const ENCODING_ALIASES = {
    // UTF-8
    'utf-8': 'utf-8',
    'utf8': 'utf-8',
    'UTF-8': 'utf-8',
    // Shift_JIS
    'shift_jis': 'shift_jis',
    'shift-jis': 'shift_jis',
    'sjis': 'shift_jis',
    'Shift_JIS': 'shift_jis',
    'x-sjis': 'shift_jis',
    // Windows-31J (CP932)
    'windows-31j': 'windows-31j',
    'cp932': 'windows-31j',
    'ms932': 'windows-31j',
    // EUC-JP
    'euc-jp': 'euc-jp',
    'eucjp': 'euc-jp',
    'EUC-JP': 'euc-jp',
    'x-euc-jp': 'euc-jp',
    // ISO-2022-JP
    'iso-2022-jp': 'iso-2022-jp',
    'ISO-2022-JP': 'iso-2022-jp',
    'jis': 'iso-2022-jp',
};
//# sourceMappingURL=types.js.map