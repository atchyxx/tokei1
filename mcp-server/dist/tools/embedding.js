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
import { getConfig } from '../config/loader.js';
/**
 * コサイン類似度を計算
 */
function cosineSimilarity(a, b) {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same dimensions');
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    if (magnitude === 0)
        return 0;
    return dotProduct / magnitude;
}
/**
 * Ollama Embedding API を呼び出し
 */
async function embedWithOllama(text, model, endpoint) {
    const response = await fetch(`${endpoint}/api/embeddings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            prompt: text,
        }),
    });
    if (!response.ok) {
        throw new Error(`Ollama embedding failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.embedding;
}
/**
 * OpenAI Embedding API を呼び出し
 */
async function embedWithOpenAI(text, model, apiKey) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            input: text,
        }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI embedding failed: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data.data[0].embedding;
}
/**
 * テキストの埋め込みベクトルを生成
 */
export async function embed(text) {
    const config = getConfig();
    const embeddingConfig = config.embedding;
    const provider = embeddingConfig?.provider ?? 'ollama';
    const model = embeddingConfig?.model ?? 'nomic-embed-text';
    let embedding;
    switch (provider) {
        case 'ollama': {
            const endpoint = embeddingConfig?.options?.endpoint ?? 'http://localhost:11434';
            embedding = await embedWithOllama(text, model, endpoint);
            break;
        }
        case 'openai': {
            const apiKey = embeddingConfig?.options?.apiKey ?? process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OpenAI API key is required for embedding');
            }
            embedding = await embedWithOpenAI(text, model, apiKey);
            break;
        }
        default:
            throw new Error(`Unsupported embedding provider: ${provider}`);
    }
    return {
        text,
        embedding,
        model,
        dimensions: embedding.length,
    };
}
/**
 * 複数テキストの埋め込みベクトルを生成
 */
export async function embedBatch(texts) {
    const results = [];
    for (const text of texts) {
        const result = await embed(text);
        results.push(result);
    }
    return results;
}
/**
 * 2つのテキストの類似度を計算
 */
export async function similarity(textA, textB) {
    const [embA, embB] = await Promise.all([embed(textA), embed(textB)]);
    const sim = cosineSimilarity(embA.embedding, embB.embedding);
    return {
        textA,
        textB,
        similarity: sim,
    };
}
/**
 * クエリに最も類似したテキストを検索
 */
export async function semanticSearch(query, documents, options) {
    const topK = options?.topK ?? 5;
    const minScore = options?.minScore ?? 0;
    // クエリの埋め込みを生成
    const queryEmbedding = await embed(query);
    // 各ドキュメントの埋め込みを生成して類似度を計算
    const results = [];
    for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const docEmbedding = await embed(doc.text);
        const score = cosineSimilarity(queryEmbedding.embedding, docEmbedding.embedding);
        if (score >= minScore) {
            results.push({
                text: doc.text,
                score,
                index: i,
                metadata: doc.metadata,
            });
        }
    }
    // スコア降順でソートしてtopK件を返却
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
}
/**
 * ベクトルを使った高速セマンティック検索
 * （事前に埋め込みが計算済みの場合）
 */
export function semanticSearchWithVectors(queryEmbedding, documentEmbeddings, options) {
    const topK = options?.topK ?? 5;
    const minScore = options?.minScore ?? 0;
    const results = [];
    for (let i = 0; i < documentEmbeddings.length; i++) {
        const doc = documentEmbeddings[i];
        const score = cosineSimilarity(queryEmbedding, doc.embedding);
        if (score >= minScore) {
            results.push({
                text: doc.text,
                score,
                index: i,
                metadata: doc.metadata,
            });
        }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
}
//# sourceMappingURL=embedding.js.map