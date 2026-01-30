/**
 * DirectVisitStrategy テスト
 *
 * TSK-TEST-001
 * REQ-SRCH-010: 検索結果0件時の自動回復
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DirectVisitStrategy,
  type DirectVisitConfig,
  type TopicConfig,
  type RecoveryContext,
  type RecoveryResult,
} from '../direct-visit.js';

describe('DirectVisitStrategy', () => {
  let strategy: DirectVisitStrategy;
  let mockConfig: DirectVisitConfig;

  beforeEach(() => {
    mockConfig = {
      topics: {
        ai: {
          keywords: ['人工知能', 'AI', '機械学習', 'ChatGPT'],
          urls: {
            official: 'https://openai.com/',
            wiki: 'https://ja.wikipedia.org/wiki/人工知能',
            market_research: 'https://example.com/ai-market',
          },
        },
        quantum: {
          keywords: ['量子コンピュータ', '量子計算', 'quantum'],
          urls: {
            official: 'https://research.ibm.com/quantum-computing',
            wiki: 'https://ja.wikipedia.org/wiki/量子コンピュータ',
          },
        },
      },
      fallback: {
        urls: {
          wiki: 'https://ja.wikipedia.org/wiki/',
        },
        appendQuery: true,
      },
    };

    strategy = new DirectVisitStrategy(mockConfig);
  });

  describe('canRecover', () => {
    it('検索結果0件でクエリがある場合にtrueを返す', () => {
      const context: RecoveryContext = {
        originalQuery: 'AI 市場規模',
        searchResults: [],
        errorType: 'no_results',
      };

      expect(strategy.canRecover(context)).toBe(true);
    });

    it('検索結果がある場合にfalseを返す', () => {
      const context: RecoveryContext = {
        originalQuery: 'AI 市場規模',
        searchResults: [{ url: 'https://example.com', title: 'Test' }],
        errorType: 'no_results',
      };

      expect(strategy.canRecover(context)).toBe(false);
    });

    it('クエリが空の場合にfalseを返す', () => {
      const context: RecoveryContext = {
        originalQuery: '',
        searchResults: [],
        errorType: 'no_results',
      };

      expect(strategy.canRecover(context)).toBe(false);
    });
  });

  describe('findMatchingTopics', () => {
    it('キーワードにマッチするトピックを検出する', () => {
      const topics = strategy.findMatchingTopics('人工知能の最新動向');
      expect(topics).toContain('ai');
    });

    it('複数のトピックにマッチする場合、すべて返す', () => {
      // quantum キーワードを含むクエリ
      const topics = strategy.findMatchingTopics('量子コンピュータとAIの融合');
      expect(topics).toContain('ai');
      expect(topics).toContain('quantum');
    });

    it('マッチするトピックがない場合、空配列を返す', () => {
      const topics = strategy.findMatchingTopics('料理レシピ');
      expect(topics).toHaveLength(0);
    });

    it('大文字小文字を区別しない', () => {
      const topics = strategy.findMatchingTopics('chatgpt の使い方');
      expect(topics).toContain('ai');
    });
  });

  describe('executeDirectVisit', () => {
    it('マッチするトピックのURLを返す', async () => {
      const context: RecoveryContext = {
        originalQuery: '人工知能 市場規模',
        searchResults: [],
        errorType: 'no_results',
      };

      const result = await strategy.executeDirectVisit(context);

      expect(result.success).toBe(true);
      expect(result.urls).toBeDefined();
      expect(result.urls!.length).toBeGreaterThan(0);
      expect(result.urls!.some((u) => u.url === 'https://openai.com/')).toBe(true);
    });

    it('マッチしない場合、フォールバックURLを使用する', async () => {
      const context: RecoveryContext = {
        originalQuery: '料理レシピ',
        searchResults: [],
        errorType: 'no_results',
      };

      const result = await strategy.executeDirectVisit(context);

      expect(result.success).toBe(true);
      expect(result.urls).toBeDefined();
      expect(result.urls!.some((u) => u.url.includes('wikipedia.org'))).toBe(true);
    });

    it('フォールバックにクエリを追加する', async () => {
      const context: RecoveryContext = {
        originalQuery: '猫の飼い方',
        searchResults: [],
        errorType: 'no_results',
      };

      const result = await strategy.executeDirectVisit(context);

      expect(result.success).toBe(true);
      // URLエンコードされたクエリが含まれる
      expect(result.urls!.some((u) => u.url.includes('%'))).toBe(true);
    });
  });

  describe('recover', () => {
    it('回復に成功した場合、RecoveryResultを返す', async () => {
      const context: RecoveryContext = {
        originalQuery: 'ChatGPT 活用事例',
        searchResults: [],
        errorType: 'no_results',
      };

      const result = await strategy.recover(context);

      expect(result.success).toBe(true);
      expect(result.strategyUsed).toBe('direct-visit');
      expect(result.urls).toBeDefined();
      expect(result.urls!.length).toBeGreaterThan(0);
    });

    it('URLにトピック情報を含める', async () => {
      const context: RecoveryContext = {
        originalQuery: '量子コンピュータの原理',
        searchResults: [],
        errorType: 'no_results',
      };

      const result = await strategy.recover(context);

      expect(result.success).toBe(true);
      expect(result.urls!.some((u) => u.topic === 'quantum')).toBe(true);
    });
  });

  describe('getStrategyName', () => {
    it('戦略名を返す', () => {
      expect(strategy.getStrategyName()).toBe('direct-visit');
    });
  });

  describe('getPriority', () => {
    it('優先度を返す', () => {
      const priority = strategy.getPriority();
      expect(typeof priority).toBe('number');
      expect(priority).toBeGreaterThan(0);
    });
  });
});

describe('DirectVisitStrategy - エッジケース', () => {
  it('設定なしでインスタンス化できる', () => {
    const strategy = new DirectVisitStrategy();
    expect(strategy).toBeDefined();
    expect(strategy.getStrategyName()).toBe('direct-visit');
  });

  it('空の設定でも動作する', () => {
    const strategy = new DirectVisitStrategy({ topics: {}, fallback: {} });
    const context: RecoveryContext = {
      originalQuery: 'テスト',
      searchResults: [],
      errorType: 'no_results',
    };

    expect(strategy.canRecover(context)).toBe(true);
  });

  it('特殊文字を含むクエリを処理できる', async () => {
    const strategy = new DirectVisitStrategy();
    const context: RecoveryContext = {
      originalQuery: 'C++ プログラミング <入門>',
      searchResults: [],
      errorType: 'no_results',
    };

    const result = await strategy.recover(context);
    expect(result.success).toBe(true);
  });
});
