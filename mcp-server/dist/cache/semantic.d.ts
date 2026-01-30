/**
 * Semantic Cache Matcher
 * v1.0.0 - REQ-CACHE-001-02
 *
 * 意味的に類似したクエリのキャッシュマッチングを行う
 * 埋め込みベクトルとコサイン類似度を使用
 */
import { CacheEntry, CacheSource } from './types.js';
import { FileCacheStore } from './store.js';
/**
 * 埋め込みベクトル
 */
export type EmbeddingVector = number[];
/**
 * クエリ埋め込みエントリ
 */
export interface QueryEmbedding {
    /** 元のクエリ文字列 */
    query: string;
    /** 埋め込みベクトル */
    embedding: EmbeddingVector;
    /** キャッシュキー */
    cacheKey: string;
    /** 作成日時 */
    createdAt: string;
    /** ソース種別 */
    source: CacheSource;
}
/**
 * 類似クエリ候補
 */
export interface SimilarQueryCandidate {
    /** 類似したクエリのキャッシュキー */
    cacheKey: string;
    /** 元のクエリ */
    originalQuery: string;
    /** 類似度スコア (0-1) */
    similarity: number;
    /** 作成日時 */
    createdAt: string;
}
/**
 * SemanticCacheMatcher設定
 */
export interface SemanticCacheConfig {
    /** 類似度の閾値 (0-1, デフォルト: 0.90) */
    similarityThreshold: number;
    /** 最大類似クエリ数 */
    maxCandidates: number;
    /** 埋め込みキャッシュの有効化 */
    enabled: boolean;
    /** 埋め込みモデル名 */
    embeddingModel: string;
    /** 埋め込み次元数 */
    embeddingDimension: number;
}
/**
 * デフォルト設定
 */
export declare const DEFAULT_SEMANTIC_CONFIG: SemanticCacheConfig;
/**
 * 埋め込みサービスインターフェース
 */
export interface IEmbeddingService {
    /** テキストから埋め込みベクトルを生成 */
    embed(text: string): Promise<EmbeddingVector>;
    /** 複数テキストの埋め込みベクトルをバッチ生成 */
    embedBatch?(texts: string[]): Promise<EmbeddingVector[]>;
    /** モデル名を取得 */
    getModelName(): string;
    /** 次元数を取得 */
    getDimension(): number;
}
/**
 * シンプルな埋め込みサービス（テスト/フォールバック用）
 * 実運用では外部APIを使用
 */
export declare class SimpleEmbeddingService implements IEmbeddingService {
    private dimension;
    private modelName;
    constructor(dimension?: number, modelName?: string);
    /**
     * 簡易埋め込み生成（ハッシュベース）
     * 実運用では OpenAI, Anthropic 等の API を使用
     */
    embed(text: string): Promise<EmbeddingVector>;
    embedBatch(texts: string[]): Promise<EmbeddingVector[]>;
    getModelName(): string;
    getDimension(): number;
}
/**
 * コサイン類似度を計算
 */
export declare function cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number;
/**
 * SemanticCacheMatcher
 * 意味的に類似したクエリのキャッシュマッチングを行う
 */
export declare class SemanticCacheMatcher {
    private config;
    private embeddingService;
    private cacheStore;
    /** 埋め込みインデックス（メモリ上） */
    private embeddingIndex;
    constructor(cacheStore: FileCacheStore, config?: Partial<SemanticCacheConfig>, embeddingService?: IEmbeddingService);
    /**
     * クエリの埋め込みを生成し、インデックスに追加
     */
    indexQuery(query: string, cacheKey: string, source: CacheSource): Promise<void>;
    /**
     * 類似クエリを検索
     */
    findSimilar(query: string, source?: CacheSource): Promise<SimilarQueryCandidate[]>;
    /**
     * 最も類似したキャッシュエントリを取得
     */
    getBestMatch<T = unknown>(query: string, source?: CacheSource): Promise<{
        entry: CacheEntry<T>;
        similarity: number;
    } | null>;
    /**
     * 埋め込みインデックスからエントリを削除
     */
    removeFromIndex(cacheKey: string): void;
    /**
     * インデックスをクリア
     */
    clearIndex(): void;
    /**
     * 永続化されたインデックスをロード
     */
    loadIndex(): Promise<number>;
    /**
     * インデックスサイズを取得
     */
    getIndexSize(): number;
    /**
     * 設定を取得
     */
    getConfig(): SemanticCacheConfig;
    /**
     * 類似度閾値を更新
     */
    setSimilarityThreshold(threshold: number): void;
    /**
     * 有効/無効を切り替え
     */
    setEnabled(enabled: boolean): void;
    /**
     * 統計情報を取得
     */
    getStats(): {
        indexSize: number;
        threshold: number;
        enabled: boolean;
        model: string;
        dimension: number;
    };
}
/**
 * デフォルトインスタンス作成関数
 */
export declare function createSemanticCacheMatcher(cacheStore: FileCacheStore, config?: Partial<SemanticCacheConfig>, embeddingService?: IEmbeddingService): SemanticCacheMatcher;
//# sourceMappingURL=semantic.d.ts.map