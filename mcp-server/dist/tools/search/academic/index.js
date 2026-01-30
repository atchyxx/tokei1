/**
 * AcademicSearchAdapter - 学術文献検索モード
 *
 * REQ-ACAD-001: 学術文献検索モード
 * DES-SHIKIGAMI-014 Section 3.4
 * TSK-TS-004
 *
 * @version 1.14.0
 */
/**
 * デフォルトオプション
 */
export const DEFAULT_ACADEMIC_OPTIONS = {
    sources: ['pubmed', 'google_scholar'],
    language: 'en',
    yearRange: { from: undefined, to: undefined },
    enableMeshConversion: true,
    maxResults: 10,
};
/**
 * MeSH用語辞書（一般用語 → MeSH用語）
 */
export const MESH_DICTIONARY = {
    // 疾患
    'がん': ['Neoplasms', 'Cancer'],
    '癌': ['Neoplasms', 'Cancer'],
    'cancer': ['Neoplasms'],
    '糖尿病': ['Diabetes Mellitus'],
    'diabetes': ['Diabetes Mellitus'],
    '高血圧': ['Hypertension'],
    'hypertension': ['Hypertension'],
    'アルツハイマー': ['Alzheimer Disease'],
    'alzheimer': ['Alzheimer Disease'],
    '心臓病': ['Heart Diseases'],
    'heart disease': ['Heart Diseases'],
    '肺炎': ['Pneumonia'],
    'pneumonia': ['Pneumonia'],
    // 治療法
    '免疫療法': ['Immunotherapy'],
    'immunotherapy': ['Immunotherapy'],
    '化学療法': ['Drug Therapy'],
    'chemotherapy': ['Drug Therapy'],
    '遺伝子治療': ['Gene Therapy'],
    'gene therapy': ['Gene Therapy'],
    '幹細胞': ['Stem Cells'],
    'stem cell': ['Stem Cells'],
    // 技術・手法
    'AI': ['Artificial Intelligence'],
    '人工知能': ['Artificial Intelligence'],
    'artificial intelligence': ['Artificial Intelligence'],
    '機械学習': ['Machine Learning'],
    'machine learning': ['Machine Learning'],
    'ディープラーニング': ['Deep Learning'],
    'deep learning': ['Deep Learning'],
    'CRISPR': ['CRISPR-Cas Systems'],
    'ゲノム編集': ['Gene Editing'],
    'genome editing': ['Gene Editing'],
    // 分野
    '神経科学': ['Neurosciences'],
    'neuroscience': ['Neurosciences'],
    '免疫学': ['Immunology'],
    'immunology': ['Immunology'],
    '分子生物学': ['Molecular Biology'],
    'molecular biology': ['Molecular Biology'],
};
/**
 * 一般用語をMeSH用語に変換
 */
export function convertToMeSH(query) {
    const words = query.toLowerCase().split(/\s+/);
    const meshTerms = [];
    const unmatchedTerms = [];
    // 単語ごとにマッチングを試みる
    for (const word of words) {
        const trimmedWord = word.trim();
        if (!trimmedWord)
            continue;
        // 完全一致を試みる
        if (MESH_DICTIONARY[trimmedWord]) {
            meshTerms.push(...MESH_DICTIONARY[trimmedWord]);
        }
        else {
            // 部分一致を試みる
            let found = false;
            for (const [key, values] of Object.entries(MESH_DICTIONARY)) {
                if (trimmedWord.includes(key) || key.includes(trimmedWord)) {
                    meshTerms.push(...values);
                    found = true;
                    break;
                }
            }
            if (!found) {
                unmatchedTerms.push(trimmedWord);
            }
        }
    }
    // 重複を除去
    const uniqueMeshTerms = [...new Set(meshTerms)];
    return {
        meshTerms: uniqueMeshTerms,
        unmatchedTerms,
    };
}
/**
 * 学術検索用にクエリをフォーマット
 */
export function formatAcademicQuery(query, options) {
    const effectiveOptions = {
        ...DEFAULT_ACADEMIC_OPTIONS,
        ...options,
    };
    let convertedQuery = query;
    let meshTerms;
    // MeSH変換
    if (effectiveOptions.enableMeshConversion) {
        const meshResult = convertToMeSH(query);
        if (meshResult.meshTerms.length > 0) {
            meshTerms = meshResult.meshTerms;
            // MeSH用語と元の用語を組み合わせる
            const combinedTerms = [
                ...meshResult.meshTerms,
                ...meshResult.unmatchedTerms,
            ];
            convertedQuery = combinedTerms.join(' ');
        }
    }
    // 年範囲フィルターを追加
    let yearFilter = '';
    if (effectiveOptions.yearRange.from || effectiveOptions.yearRange.to) {
        const from = effectiveOptions.yearRange.from ?? 1900;
        const to = effectiveOptions.yearRange.to ?? new Date().getFullYear();
        yearFilter = `${from}:${to}`;
    }
    // ソース別クエリを生成
    const sourceQueries = {};
    const sourceUrls = {};
    if (effectiveOptions.sources.includes('pubmed')) {
        // PubMed用クエリ
        let pubmedQuery = convertedQuery;
        if (meshTerms && meshTerms.length > 0) {
            pubmedQuery = meshTerms.map((term) => `"${term}"[MeSH]`).join(' OR ');
        }
        if (yearFilter) {
            pubmedQuery += ` AND ${yearFilter}[dp]`;
        }
        sourceQueries.pubmed = pubmedQuery;
        sourceUrls.pubmed = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(pubmedQuery)}`;
    }
    if (effectiveOptions.sources.includes('google_scholar')) {
        // Google Scholar用クエリ
        let scholarQuery = convertedQuery;
        if (yearFilter) {
            const [from, to] = yearFilter.split(':');
            scholarQuery += ` after:${from} before:${to}`;
        }
        sourceQueries.googleScholar = scholarQuery;
        sourceUrls.googleScholar = `https://scholar.google.com/scholar?q=${encodeURIComponent(scholarQuery)}`;
    }
    if (effectiveOptions.sources.includes('semantic_scholar')) {
        // Semantic Scholar用クエリ
        sourceQueries.semanticScholar = convertedQuery;
        sourceUrls.semanticScholar = `https://www.semanticscholar.org/search?q=${encodeURIComponent(convertedQuery)}`;
    }
    return {
        originalQuery: query,
        convertedQuery,
        meshTerms,
        sourceQueries,
        sourceUrls,
    };
}
/**
 * 検索クエリが学術的かどうかを判定
 */
export function isAcademicQuery(query) {
    const academicIndicators = [
        // 学術キーワード
        '論文', 'paper', 'research', '研究', 'study', '調査',
        'clinical', '臨床', 'trial', '治験',
        'review', 'レビュー', 'meta-analysis', 'メタ分析',
        'journal', 'ジャーナル', 'publication', '出版',
        // 学術ソース
        'pubmed', 'scholar', 'arxiv', 'nature', 'science',
        // 学術フレーズ
        'et al', '参考文献', 'reference', 'citation', '引用',
    ];
    const lowerQuery = query.toLowerCase();
    return academicIndicators.some((indicator) => lowerQuery.includes(indicator.toLowerCase()));
}
/**
 * AcademicSearchAdapter - 学術検索アダプター
 */
export class AcademicSearchAdapter {
    options;
    constructor(options) {
        this.options = { ...DEFAULT_ACADEMIC_OPTIONS, ...options };
    }
    /**
     * クエリを学術検索用に変換
     */
    formatQuery(query) {
        return formatAcademicQuery(query, this.options);
    }
    /**
     * MeSH用語に変換
     */
    convertToMeSH(query) {
        return convertToMeSH(query);
    }
    /**
     * 学術クエリかどうかを判定
     */
    isAcademicQuery(query) {
        return isAcademicQuery(query);
    }
    /**
     * オプションを取得
     */
    getOptions() {
        return { ...this.options };
    }
    /**
     * 年範囲を設定
     */
    setYearRange(from, to) {
        this.options.yearRange = { from, to };
    }
    /**
     * MeSH辞書に用語を追加
     */
    static addMeshTerm(term, meshTerms) {
        MESH_DICTIONARY[term.toLowerCase()] = meshTerms;
    }
    /**
     * MeSH辞書を取得
     */
    static getMeshDictionary() {
        return { ...MESH_DICTIONARY };
    }
}
//# sourceMappingURL=index.js.map