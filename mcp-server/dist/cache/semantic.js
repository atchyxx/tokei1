/**
 * Semantic Cache Matcher
 * v1.0.0 - REQ-CACHE-001-02
 *
 * 意味的に類似したクエリのキャッシュマッチングを行う
 * 埋め込みベクトルとコサイン類似度を使用
 */
/**
 * デフォルト設定
 */
export const DEFAULT_SEMANTIC_CONFIG = {
    similarityThreshold: 0.90,
    maxCandidates: 5,
    enabled: true,
    embeddingModel: 'default',
    embeddingDimension: 1536,
};
/**
 * シンプルな埋め込みサービス（テスト/フォールバック用）
 * 実運用では外部APIを使用
 */
export class SimpleEmbeddingService {
    dimension;
    modelName;
    constructor(dimension = 64, modelName = 'simple-hash') {
        this.dimension = dimension;
        this.modelName = modelName;
    }
    /**
     * 簡易埋め込み生成（ハッシュベース）
     * 実運用では OpenAI, Anthropic 等の API を使用
     */
    async embed(text) {
        const normalized = text.toLowerCase().trim();
        const vector = new Array(this.dimension).fill(0);
        // シンプルなハッシュベースの埋め込み
        for (let i = 0; i < normalized.length; i++) {
            const charCode = normalized.charCodeAt(i);
            const idx = (charCode * (i + 1)) % this.dimension;
            vector[idx] += charCode / 127; // normalize to ~1
        }
        // 正規化
        const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
        return vector.map((v) => v / magnitude);
    }
    async embedBatch(texts) {
        return Promise.all(texts.map((t) => this.embed(t)));
    }
    getModelName() {
        return this.modelName;
    }
    getDimension() {
        return this.dimension;
    }
}
/**
 * コサイン類似度を計算
 */
export function cosineSimilarity(a, b) {
    if (a.length !== b.length) {
        throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
    }
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        magnitudeA += a[i] * a[i];
        magnitudeB += b[i] * b[i];
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }
    return dotProduct / (magnitudeA * magnitudeB);
}
/**
 * SemanticCacheMatcher
 * 意味的に類似したクエリのキャッシュマッチングを行う
 */
export class SemanticCacheMatcher {
    config;
    embeddingService;
    cacheStore;
    /** 埋め込みインデックス（メモリ上） */
    embeddingIndex = new Map();
    constructor(cacheStore, config = {}, embeddingService) {
        this.config = { ...DEFAULT_SEMANTIC_CONFIG, ...config };
        this.cacheStore = cacheStore;
        this.embeddingService =
            embeddingService || new SimpleEmbeddingService(this.config.embeddingDimension);
    }
    /**
     * クエリの埋め込みを生成し、インデックスに追加
     */
    async indexQuery(query, cacheKey, source) {
        if (!this.config.enabled)
            return;
        const embedding = await this.embeddingService.embed(query);
        const entry = {
            query,
            embedding,
            cacheKey,
            source,
            createdAt: new Date().toISOString(),
        };
        this.embeddingIndex.set(cacheKey, entry);
        // 埋め込みもキャッシュストアに保存（永続化）
        await this.cacheStore.set(`embedding:${cacheKey}`, entry, {
            source: 'embedding',
            ttlSeconds: 3600 * 24, // 24時間
        });
    }
    /**
     * 類似クエリを検索
     */
    async findSimilar(query, source) {
        if (!this.config.enabled)
            return [];
        const queryEmbedding = await this.embeddingService.embed(query);
        const candidates = [];
        // メモリインデックスから検索
        for (const [_key, entry] of this.embeddingIndex) {
            // ソースフィルタ
            if (source && entry.source !== source)
                continue;
            const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
            if (similarity >= this.config.similarityThreshold) {
                candidates.push({
                    cacheKey: entry.cacheKey,
                    originalQuery: entry.query,
                    similarity,
                    createdAt: entry.createdAt,
                });
            }
        }
        // 類似度でソートして上位を返す
        return candidates
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, this.config.maxCandidates);
    }
    /**
     * 最も類似したキャッシュエントリを取得
     */
    async getBestMatch(query, source) {
        const candidates = await this.findSimilar(query, source);
        if (candidates.length === 0) {
            return null;
        }
        const best = candidates[0];
        const result = await this.cacheStore.get(best.cacheKey);
        if (result.hit && result.value !== undefined) {
            return {
                entry: {
                    key: best.cacheKey,
                    value: result.value,
                    meta: result.meta,
                },
                similarity: best.similarity,
            };
        }
        return null;
    }
    /**
     * 埋め込みインデックスからエントリを削除
     */
    removeFromIndex(cacheKey) {
        this.embeddingIndex.delete(cacheKey);
    }
    /**
     * インデックスをクリア
     */
    clearIndex() {
        this.embeddingIndex.clear();
    }
    /**
     * 永続化されたインデックスをロード
     */
    async loadIndex() {
        const entries = await this.cacheStore.query({
            source: 'embedding',
            limit: 10000,
        });
        let loadedCount = 0;
        for (const entry of entries) {
            const queryEmbedding = entry.value;
            if (queryEmbedding.cacheKey && queryEmbedding.embedding) {
                this.embeddingIndex.set(queryEmbedding.cacheKey, queryEmbedding);
                loadedCount++;
            }
        }
        return loadedCount;
    }
    /**
     * インデックスサイズを取得
     */
    getIndexSize() {
        return this.embeddingIndex.size;
    }
    /**
     * 設定を取得
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 類似度閾値を更新
     */
    setSimilarityThreshold(threshold) {
        if (threshold < 0 || threshold > 1) {
            throw new Error('Threshold must be between 0 and 1');
        }
        this.config.similarityThreshold = threshold;
    }
    /**
     * 有効/無効を切り替え
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
    }
    /**
     * 統計情報を取得
     */
    getStats() {
        return {
            indexSize: this.embeddingIndex.size,
            threshold: this.config.similarityThreshold,
            enabled: this.config.enabled,
            model: this.embeddingService.getModelName(),
            dimension: this.embeddingService.getDimension(),
        };
    }
}
/**
 * デフォルトインスタンス作成関数
 */
export function createSemanticCacheMatcher(cacheStore, config, embeddingService) {
    return new SemanticCacheMatcher(cacheStore, config, embeddingService);
}
//# sourceMappingURL=semantic.js.map