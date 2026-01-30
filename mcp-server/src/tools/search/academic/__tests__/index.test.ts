/**
 * AcademicSearchAdapter テスト
 *
 * TSK-TEST-004
 * REQ-ACAD-001: 学術的クエリ変換
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AcademicSearchAdapter,
  type AcademicSearchOptions,
  type AcademicQueryResult,
  convertToMeSH,
  formatAcademicQuery,
  isAcademicQuery,
  MESH_DICTIONARY,
} from '../index.js';

describe('AcademicSearchAdapter', () => {
  let adapter: AcademicSearchAdapter;

  beforeEach(() => {
    adapter = new AcademicSearchAdapter();
  });

  describe('formatQuery', () => {
    it('医学用語をMeSH用語に変換する', () => {
      const result = adapter.formatQuery('糖尿病の治療');

      expect(result.meshTerms).toBeDefined();
      expect(result.meshTerms.some((t) => t.mesh === 'Diabetes Mellitus')).toBe(
        true
      );
    });

    it('複数の用語を変換する', () => {
      const result = adapter.convertQuery('がん 化学療法');

      expect(result.meshTerms.length).toBeGreaterThanOrEqual(2);
    });

    it('変換できない用語はそのまま保持する', () => {
      const result = adapter.convertQuery('特殊な未知の用語');

      expect(result.originalQuery).toBe('特殊な未知の用語');
      expect(result.enhancedQuery).toBeDefined();
    });

    it('英語用語も変換する', () => {
      const result = adapter.convertQuery('machine learning algorithm');

      expect(result.meshTerms).toBeDefined();
    });
  });

  describe('formatForPubMed', () => {
    it('PubMed形式のクエリを生成する', () => {
      const query = adapter.formatForPubMed('糖尿病 治療');

      expect(query).toContain('[MeSH]');
    });

    it('複数のMeSH用語をANDで結合する', () => {
      const query = adapter.formatForPubMed('がん 化学療法');

      expect(query).toContain(' AND ');
    });

    it('オプションで年代制限を追加する', () => {
      const query = adapter.formatForPubMed('糖尿病', { yearFrom: 2020 });

      expect(query).toContain('2020');
    });
  });

  describe('formatForGoogleScholar', () => {
    it('Google Scholar形式のクエリを生成する', () => {
      const query = adapter.formatForGoogleScholar('機械学習');

      expect(query).toBeDefined();
      expect(typeof query).toBe('string');
    });

    it('日本語クエリを処理する', () => {
      const query = adapter.formatForGoogleScholar('人工知能の応用');

      expect(query).toContain('人工知能');
    });
  });

  describe('getSourceUrls', () => {
    it('学術ソースのURLリストを返す', () => {
      const urls = adapter.getSourceUrls('diabetes treatment');

      expect(urls).toBeDefined();
      expect(urls.pubmed).toBeDefined();
      expect(urls.googleScholar).toBeDefined();
    });

    it('クエリをURLエンコードする', () => {
      const urls = adapter.getSourceUrls('糖尿病 治療');

      expect(urls.pubmed).toContain('%');
      expect(urls.googleScholar).toContain('%');
    });

    it('Semantic Scholarを含む', () => {
      const urls = adapter.getSourceUrls('AI research');

      expect(urls.semanticScholar).toBeDefined();
    });
  });

  describe('isAcademic', () => {
    it('学術的なクエリを検出する', () => {
      const academicQueries = [
        '論文',
        '研究',
        'research',
        'study',
        'systematic review',
        'meta-analysis',
        'clinical trial',
        '臨床試験',
      ];

      for (const query of academicQueries) {
        expect(adapter.isAcademic(query)).toBe(true);
      }
    });

    it('一般的なクエリは学術的でないと判定する', () => {
      const generalQueries = [
        '天気予報',
        'レストラン',
        'ニュース',
        'ショッピング',
      ];

      for (const query of generalQueries) {
        expect(adapter.isAcademic(query)).toBe(false);
      }
    });
  });
});

describe('convertToMeSH', () => {
  it('日本語医学用語を変換する', () => {
    const mappings = convertToMeSH('糖尿病');

    expect(mappings.length).toBeGreaterThan(0);
    expect(mappings[0].mesh).toBe('Diabetes Mellitus');
  });

  it('複数の用語を変換する', () => {
    const mappings = convertToMeSH('高血圧 心臓病');

    expect(mappings.length).toBeGreaterThanOrEqual(2);
  });

  it('信頼度を含める', () => {
    const mappings = convertToMeSH('がん');

    expect(mappings[0].confidence).toBeDefined();
    expect(mappings[0].confidence).toBeGreaterThan(0);
  });

  it('同義語をマッピングする', () => {
    const mappings1 = convertToMeSH('人工知能');
    const mappings2 = convertToMeSH('AI');

    // 両方とも同じMeSH用語にマッピングされる
    expect(mappings1.some((m) => m.mesh === 'Artificial Intelligence')).toBe(
      true
    );
    expect(mappings2.some((m) => m.mesh === 'Artificial Intelligence')).toBe(
      true
    );
  });
});

describe('formatAcademicQuery', () => {
  it('PubMed形式でフォーマットする', () => {
    const query = formatAcademicQuery('diabetes', 'pubmed');

    expect(query).toContain('[MeSH]');
  });

  it('Google Scholar形式でフォーマットする', () => {
    const query = formatAcademicQuery('machine learning', 'googleScholar');

    expect(query).toBeDefined();
  });

  it('Semantic Scholar形式でフォーマットする', () => {
    const query = formatAcademicQuery('deep learning', 'semanticScholar');

    expect(query).toBeDefined();
  });

  it('汎用形式でフォーマットする', () => {
    const query = formatAcademicQuery('AI research', 'generic');

    expect(query).toBeDefined();
  });
});

describe('isAcademicQuery', () => {
  it('学術キーワードを検出する', () => {
    expect(isAcademicQuery('論文を探す')).toBe(true);
    expect(isAcademicQuery('研究結果')).toBe(true);
    expect(isAcademicQuery('学術論文')).toBe(true);
    expect(isAcademicQuery('peer-reviewed')).toBe(true);
  });

  it('医学用語を検出する', () => {
    expect(isAcademicQuery('糖尿病の治療法')).toBe(true);
    expect(isAcademicQuery('心臓病のリスク')).toBe(true);
  });

  it('一般的なクエリは検出しない', () => {
    expect(isAcademicQuery('おいしいラーメン')).toBe(false);
    expect(isAcademicQuery('最新のスマホ')).toBe(false);
  });
});

describe('getAcademicSourceUrls', () => {
  it('すべてのソースURLを返す', () => {
    const urls = getAcademicSourceUrls('cancer treatment');

    expect(urls.pubmed).toMatch(/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov/);
    expect(urls.googleScholar).toMatch(/^https:\/\/scholar\.google\.com/);
    expect(urls.semanticScholar).toMatch(/^https:\/\/www\.semanticscholar\.org/);
  });

  it('日本語クエリをエンコードする', () => {
    const urls = getAcademicSourceUrls('がん治療');

    // URLエンコードされている
    expect(urls.pubmed).toContain('%');
    expect(urls.googleScholar).toContain('%');
  });
});

describe('AcademicSearchAdapter - エッジケース', () => {
  let adapter: AcademicSearchAdapter;

  beforeEach(() => {
    adapter = new AcademicSearchAdapter();
  });

  it('空のクエリを処理する', () => {
    const result = adapter.convertQuery('');

    expect(result.meshTerms).toHaveLength(0);
    expect(result.originalQuery).toBe('');
  });

  it('特殊文字を含むクエリを処理する', () => {
    const result = adapter.convertQuery('COVID-19 (coronavirus)');

    expect(result.enhancedQuery).toBeDefined();
  });

  it('長いクエリを処理する', () => {
    const longQuery =
      '人工知能を用いた糖尿病患者の血糖値予測に関する機械学習アルゴリズムの比較研究';
    const result = adapter.convertQuery(longQuery);

    expect(result.meshTerms.length).toBeGreaterThan(0);
  });

  it('カスタムMeSH辞書を使用できる', () => {
    const customAdapter = new AcademicSearchAdapter({
      customMeSH: {
        'カスタム用語': 'Custom Term',
      },
    });

    const result = customAdapter.convertQuery('カスタム用語');

    expect(result.meshTerms.some((t) => t.mesh === 'Custom Term')).toBe(true);
  });
});
