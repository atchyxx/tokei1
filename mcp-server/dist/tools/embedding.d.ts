/**
 * Embedding Service
 *
 * Implements REQ-CS-002: セマンティック検索
 *
 * Supports:
 * - Ollama (local, default)
 * - OpenAI Embeddings API
 *
 * Used for semantic search, similarity matching, and context retrieval.
 */
export interface EmbeddingResult {
    /** 入力テキスト */
    text: string;
    /** 埋め込みベクトル */
    embedding: number[];
    /** モデル名 */
    model: string;
    /** ベクトル次元数 */
    dimensions: number;
}
export interface SimilarityResult {
    /** テキストA */
    textA: string;
    /** テキストB */
    textB: string;
    /** コサイン類似度 (0-1) */
    similarity: number;
}
export interface SearchResult {
    /** 検索対象テキスト */
    text: string;
    /** 類似度スコア */
    score: number;
    /** インデックス（元の配列での位置） */
    index: number;
    /** メタデータ（任意） */
    metadata?: Record<string, unknown>;
}
/**
 * テキストの埋め込みベクトルを生成
 */
export declare function embed(text: string): Promise<EmbeddingResult>;
/**
 * 複数テキストの埋め込みベクトルを生成
 */
export declare function embedBatch(texts: string[]): Promise<EmbeddingResult[]>;
/**
 * 2つのテキストの類似度を計算
 */
export declare function similarity(textA: string, textB: string): Promise<SimilarityResult>;
/**
 * クエリに最も類似したテキストを検索
 */
export declare function semanticSearch(query: string, documents: Array<{
    text: string;
    metadata?: Record<string, unknown>;
}>, options?: {
    /** 返却する最大件数 */
    topK?: number;
    /** 最小類似度閾値 */
    minScore?: number;
}): Promise<SearchResult[]>;
/**
 * ベクトルを使った高速セマンティック検索
 * （事前に埋め込みが計算済みの場合）
 */
export declare function semanticSearchWithVectors(queryEmbedding: number[], documentEmbeddings: Array<{
    embedding: number[];
    text: string;
    metadata?: Record<string, unknown>;
}>, options?: {
    topK?: number;
    minScore?: number;
}): SearchResult[];
//# sourceMappingURL=embedding.d.ts.map