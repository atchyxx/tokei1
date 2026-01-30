/**
 * FreshnessEvaluator テスト
 *
 * TSK-TEST-006
 * REQ-FRESH-001: 情報鮮度自動評価
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  FreshnessEvaluator,
  type FreshnessLevel,
  type FreshnessResult,
  type FreshnessOptions,
  evaluateFreshness,
  extractDateFromHTML,
  extractDateFromText,
  calculateFreshnessLevel,
  calculateFreshnessScore,
  TOPIC_FRESHNESS_THRESHOLDS,
  DEFAULT_FRESHNESS_OPTIONS,
} from '../freshness-evaluator.js';

describe('FreshnessEvaluator', () => {
  let evaluator: FreshnessEvaluator;
  const referenceDate = new Date('2024-06-01');

  beforeEach(() => {
    evaluator = new FreshnessEvaluator({ referenceDate });
  });

  describe('evaluate', () => {
    it('最近の日付をfreshと判定する', () => {
      const html = `
        <html>
          <head>
            <meta property="article:published_time" content="2024-05-15" />
          </head>
          <body>コンテンツ</body>
        </html>
      `;

      const result = evaluator.evaluate(html);

      expect(result.level).toBe('fresh');
      expect(result.daysOld).toBeLessThan(30);
    });

    it('古い日付をoutdatedと判定する', () => {
      const html = `
        <html>
          <head>
            <meta property="article:published_time" content="2020-01-01" />
          </head>
          <body>コンテンツ</body>
        </html>
      `;

      const result = evaluator.evaluate(html);

      expect(result.level).toBe('outdated');
      expect(result.daysOld).toBeGreaterThan(365);
    });

    it('日付がない場合はunknownと判定する', () => {
      const html = '<html><body>日付なしのコンテンツ</body></html>';

      const result = evaluator.evaluate(html);

      expect(result.level).toBe('unknown');
      expect(result.confidence).toBe(0);
    });
  });

  describe('evaluateWithTopic', () => {
    it('ニュースは1日でstaleになる', () => {
      const html = `
        <html>
          <head>
            <meta property="article:published_time" content="2024-05-30" />
          </head>
          <body>ニュース記事</body>
        </html>
      `;

      const result = evaluator.evaluateWithTopic(html, 'news');

      // 2日前なのでニュースとしてはstale
      expect(['recent', 'stale']).toContain(result.level);
    });

    it('学術論文は1年前でもfresh', () => {
      const html = `
        <html>
          <head>
            <meta property="article:published_time" content="2023-07-01" />
          </head>
          <body>学術論文</body>
        </html>
      `;

      const result = evaluator.evaluateWithTopic(html, 'academic');

      expect(result.level).toBe('fresh');
    });

    it('未知のトピックはデフォルト閾値を使用する', () => {
      const html = `
        <html>
          <head>
            <meta property="article:published_time" content="2024-05-01" />
          </head>
          <body>コンテンツ</body>
        </html>
      `;

      const result = evaluator.evaluateWithTopic(html, 'unknown_topic');

      expect(result.level).toBe('fresh');
    });
  });

  describe('formatResult', () => {
    it('結果をフォーマットする', () => {
      const result: FreshnessResult = {
        level: 'fresh',
        publishDate: new Date('2024-05-15'),
        confidence: 0.9,
        daysOld: 17,
        score: 85,
      };

      const formatted = evaluator.formatResult(result);

      expect(formatted).toContain('FRESH');
      expect(formatted).toContain('🟢');
      expect(formatted).toContain('17日');
      expect(formatted).toContain('85/100');
    });

    it('警告を含める', () => {
      const result: FreshnessResult = {
        level: 'stale',
        publishDate: new Date('2023-01-01'),
        confidence: 0.8,
        daysOld: 500,
        score: 30,
        warnings: ['情報が古くなっています'],
      };

      const formatted = evaluator.formatResult(result);

      expect(formatted).toContain('⚠️');
      expect(formatted).toContain('警告');
    });
  });

  describe('static methods', () => {
    it('getAvailableTopics が利用可能なトピックを返す', () => {
      const topics = FreshnessEvaluator.getAvailableTopics();

      expect(topics).toContain('news');
      expect(topics).toContain('academic');
      expect(topics).toContain('technology');
    });

    it('getTopicThresholds がトピックの閾値を返す', () => {
      const thresholds = FreshnessEvaluator.getTopicThresholds('news');

      expect(thresholds).toBeDefined();
      expect(thresholds?.fresh).toBe(1);
      expect(thresholds?.recent).toBe(7);
    });

    it('getLevelDescription がレベル説明を返す', () => {
      expect(FreshnessEvaluator.getLevelDescription('fresh')).toContain('最新');
      expect(FreshnessEvaluator.getLevelDescription('outdated')).toContain('古い');
    });

    it('getLevelEmoji が絵文字を返す', () => {
      expect(FreshnessEvaluator.getLevelEmoji('fresh')).toBe('🟢');
      expect(FreshnessEvaluator.getLevelEmoji('outdated')).toBe('🔴');
    });
  });
});

describe('extractDateFromHTML', () => {
  it('JSON-LDから日付を抽出する', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
            {"@type": "Article", "datePublished": "2024-03-15T10:00:00Z"}
          </script>
        </head>
        <body></body>
      </html>
    `;

    const result = extractDateFromHTML(html);

    expect(result.publishDate).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.method).toBe('json-ld');
  });

  it('メタタグから日付を抽出する', () => {
    const html = `
      <html>
        <head>
          <meta property="article:published_time" content="2024-04-20">
        </head>
        <body></body>
      </html>
    `;

    const result = extractDateFromHTML(html);

    expect(result.publishDate).toBeDefined();
    expect(result.publishDate?.getMonth()).toBe(3); // April = 3
  });

  it('time要素から日付を抽出する', () => {
    const html = `
      <html>
        <body>
          <time datetime="2024-05-10">2024年5月10日</time>
        </body>
      </html>
    `;

    const result = extractDateFromHTML(html);

    expect(result.publishDate).toBeDefined();
    expect(result.publishDate?.getDate()).toBe(10);
  });

  it('更新日と公開日を区別する', () => {
    const html = `
      <html>
        <head>
          <meta property="article:published_time" content="2024-01-01">
          <meta property="article:modified_time" content="2024-06-01">
        </head>
        <body></body>
      </html>
    `;

    const result = extractDateFromHTML(html);

    expect(result.publishDate).toBeDefined();
    expect(result.updateDate).toBeDefined();
    expect(result.updateDate?.getMonth()).toBe(5); // June = 5
  });
});

describe('extractDateFromText', () => {
  it('日本語形式の日付を抽出する', () => {
    const result = extractDateFromText('公開日: 2024年3月15日');

    expect(result).not.toBeNull();
    expect(result?.date.getFullYear()).toBe(2024);
    expect(result?.date.getMonth()).toBe(2); // March = 2
    expect(result?.date.getDate()).toBe(15);
  });

  it('ISO形式の日付を抽出する', () => {
    const result = extractDateFromText('Date: 2024-04-20');

    expect(result).not.toBeNull();
    expect(result?.date.getFullYear()).toBe(2024);
  });

  it('英語形式の日付を抽出する', () => {
    const result = extractDateFromText('Published on January 15, 2024');

    expect(result).not.toBeNull();
    expect(result?.date.getMonth()).toBe(0); // January = 0
  });

  it('更新日表記を優先する', () => {
    const result = extractDateFromText('公開: 2024年1月1日 更新: 2024年6月1日');

    expect(result).not.toBeNull();
    expect(result?.date.getMonth()).toBe(5); // June = 5 (更新日を優先)
  });
});

describe('calculateFreshnessLevel', () => {
  it('freshThresholdDays以内はfresh', () => {
    const level = calculateFreshnessLevel(10, DEFAULT_FRESHNESS_OPTIONS);
    expect(level).toBe('fresh');
  });

  it('recentThresholdDays以内はrecent', () => {
    const level = calculateFreshnessLevel(60, DEFAULT_FRESHNESS_OPTIONS);
    expect(level).toBe('recent');
  });

  it('staleThresholdDays以内はstale', () => {
    const level = calculateFreshnessLevel(200, DEFAULT_FRESHNESS_OPTIONS);
    expect(level).toBe('stale');
  });

  it('staleThresholdDays超過はoutdated', () => {
    const level = calculateFreshnessLevel(500, DEFAULT_FRESHNESS_OPTIONS);
    expect(level).toBe('outdated');
  });

  it('負の日数はunknown', () => {
    const level = calculateFreshnessLevel(-1, DEFAULT_FRESHNESS_OPTIONS);
    expect(level).toBe('unknown');
  });
});

describe('calculateFreshnessScore', () => {
  it('0日は100点', () => {
    const score = calculateFreshnessScore(0, DEFAULT_FRESHNESS_OPTIONS);
    expect(score).toBe(100);
  });

  it('時間経過で減少する', () => {
    const score30 = calculateFreshnessScore(30, DEFAULT_FRESHNESS_OPTIONS);
    const score90 = calculateFreshnessScore(90, DEFAULT_FRESHNESS_OPTIONS);
    const score180 = calculateFreshnessScore(180, DEFAULT_FRESHNESS_OPTIONS);

    expect(score30).toBeGreaterThan(score90);
    expect(score90).toBeGreaterThan(score180);
  });

  it('負の日数は0点', () => {
    const score = calculateFreshnessScore(-1, DEFAULT_FRESHNESS_OPTIONS);
    expect(score).toBe(0);
  });

  it('スコアは0-100の範囲', () => {
    const score = calculateFreshnessScore(10000, DEFAULT_FRESHNESS_OPTIONS);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('evaluateFreshness', () => {
  it('関数として直接呼び出せる', () => {
    const html = `
      <html>
        <head>
          <meta property="article:published_time" content="2024-05-01">
        </head>
        <body></body>
      </html>
    `;

    const result = evaluateFreshness(html, { referenceDate: new Date('2024-06-01') });

    expect(result.level).toBe('fresh');
  });

  it('プレーンテキストを処理する', () => {
    const text = '更新日: 2024年5月15日\nこれはテキストコンテンツです。';

    const result = evaluateFreshness(text, { referenceDate: new Date('2024-06-01') });

    expect(result.level).toBeDefined();
    expect(result.detectionMethod).toBe('text-extraction');
  });
});

describe('TOPIC_FRESHNESS_THRESHOLDS', () => {
  it('ニュースの閾値が最も厳しい', () => {
    const news = TOPIC_FRESHNESS_THRESHOLDS.news;
    const academic = TOPIC_FRESHNESS_THRESHOLDS.academic;

    expect(news.fresh).toBeLessThan(academic.fresh);
    expect(news.stale).toBeLessThan(academic.stale);
  });

  it('すべてのトピックに3つの閾値がある', () => {
    for (const [topic, thresholds] of Object.entries(TOPIC_FRESHNESS_THRESHOLDS)) {
      expect(thresholds.fresh).toBeDefined();
      expect(thresholds.recent).toBeDefined();
      expect(thresholds.stale).toBeDefined();
      expect(thresholds.fresh).toBeLessThan(thresholds.recent);
      expect(thresholds.recent).toBeLessThan(thresholds.stale);
    }
  });
});
