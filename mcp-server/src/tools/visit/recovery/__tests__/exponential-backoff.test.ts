/**
 * ExponentialBackoffManager テスト
 *
 * TSK-TEST-002
 * REQ-HTTP-001: Exponential Backoff リトライ
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  ExponentialBackoffManager,
  type BackoffConfig,
  type RetryContext,
  retryWithBackoff,
  isRetryableError,
  isRetryableStatusCode,
  DEFAULT_BACKOFF_CONFIG,
} from '../exponential-backoff.js';

describe('ExponentialBackoffManager', () => {
  let manager: ExponentialBackoffManager;

  beforeEach(() => {
    manager = new ExponentialBackoffManager();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateDelay', () => {
    it('初回リトライは baseDelayMs を返す', () => {
      const delay = manager.calculateDelay(1);
      expect(delay).toBeGreaterThanOrEqual(DEFAULT_BACKOFF_CONFIG.baseDelayMs);
      // ジッターがあるので範囲でチェック
      expect(delay).toBeLessThanOrEqual(
        DEFAULT_BACKOFF_CONFIG.baseDelayMs *
          (1 + DEFAULT_BACKOFF_CONFIG.jitterFactor)
      );
    });

    it('リトライ回数に応じて指数的に増加する', () => {
      const delay1 = manager.calculateDelay(1);
      const delay2 = manager.calculateDelay(2);
      const delay3 = manager.calculateDelay(3);

      // ジッターを除いた基本値で比較
      expect(delay2).toBeGreaterThan(delay1 * 0.8);
      expect(delay3).toBeGreaterThan(delay2 * 0.8);
    });

    it('maxDelayMs を超えない', () => {
      const delay = manager.calculateDelay(100);
      expect(delay).toBeLessThanOrEqual(
        DEFAULT_BACKOFF_CONFIG.maxDelayMs *
          (1 + DEFAULT_BACKOFF_CONFIG.jitterFactor)
      );
    });

    it('カスタム設定で動作する', () => {
      const customManager = new ExponentialBackoffManager({
        baseDelayMs: 500,
        maxDelayMs: 2000,
        multiplier: 3,
        jitterFactor: 0,
      });

      expect(customManager.calculateDelay(1)).toBe(500);
      expect(customManager.calculateDelay(2)).toBe(1500);
      expect(customManager.calculateDelay(3)).toBe(2000); // maxDelayMs で制限
    });
  });

  describe('shouldRetry', () => {
    it('最大リトライ回数未満であればtrueを返す', () => {
      const context: RetryContext = {
        attempt: 1,
        statusCode: 503,
        error: new Error('Service Unavailable'),
      };

      expect(manager.shouldRetry(context)).toBe(true);
    });

    it('最大リトライ回数に達したらfalseを返す', () => {
      const context: RetryContext = {
        attempt: DEFAULT_BACKOFF_CONFIG.maxRetries,
        statusCode: 503,
        error: new Error('Service Unavailable'),
      };

      expect(manager.shouldRetry(context)).toBe(false);
    });

    it('リトライ不可能なステータスコードではfalseを返す', () => {
      const context: RetryContext = {
        attempt: 1,
        statusCode: 404,
        error: new Error('Not Found'),
      };

      expect(manager.shouldRetry(context)).toBe(false);
    });

    it('リトライ可能なステータスコードではtrueを返す', () => {
      const retryableCodes = [408, 429, 500, 502, 503, 504];

      for (const code of retryableCodes) {
        const context: RetryContext = {
          attempt: 1,
          statusCode: code,
          error: new Error('Error'),
        };

        expect(manager.shouldRetry(context)).toBe(true);
      }
    });
  });

  describe('execute', () => {
    it('成功した場合、結果を返す', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await manager.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('リトライ可能なエラーで再試行する', async () => {
      const error = new Error('Service Unavailable');
      (error as any).statusCode = 503;

      const fn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const executePromise = manager.execute(fn);

      // 最初の失敗
      await vi.advanceTimersByTimeAsync(0);
      // 1回目のリトライ待機
      await vi.advanceTimersByTimeAsync(DEFAULT_BACKOFF_CONFIG.baseDelayMs * 2);
      // 2回目のリトライ待機
      await vi.advanceTimersByTimeAsync(DEFAULT_BACKOFF_CONFIG.baseDelayMs * 4);

      const result = await executePromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('最大リトライ回数を超えたらエラーをスローする', async () => {
      const error = new Error('Service Unavailable');
      (error as any).statusCode = 503;

      const fn = vi.fn().mockRejectedValue(error);

      const executePromise = manager.execute(fn);

      // すべてのリトライを消費
      for (let i = 0; i < DEFAULT_BACKOFF_CONFIG.maxRetries + 1; i++) {
        await vi.advanceTimersByTimeAsync(DEFAULT_BACKOFF_CONFIG.maxDelayMs * 2);
      }

      await expect(executePromise).rejects.toThrow('Service Unavailable');
    });

    it('リトライ不可能なエラーは即座にスローする', async () => {
      const error = new Error('Not Found');
      (error as any).statusCode = 404;

      const fn = vi.fn().mockRejectedValue(error);

      await expect(manager.execute(fn)).rejects.toThrow('Not Found');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('関数をラップしてリトライ機能を提供する', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await retryWithBackoff(fn);

    expect(result).toBe('success');
  });

  it('カスタム設定を受け入れる', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await retryWithBackoff(fn, {
      baseDelayMs: 100,
      maxRetries: 5,
    });

    expect(result).toBe('success');
  });
});

describe('isRetryableStatusCode', () => {
  it('408, 429, 500, 502, 503, 504 はリトライ可能', () => {
    expect(isRetryableStatusCode(408)).toBe(true);
    expect(isRetryableStatusCode(429)).toBe(true);
    expect(isRetryableStatusCode(500)).toBe(true);
    expect(isRetryableStatusCode(502)).toBe(true);
    expect(isRetryableStatusCode(503)).toBe(true);
    expect(isRetryableStatusCode(504)).toBe(true);
  });

  it('2xx, 3xx, 4xx（一部除く）はリトライ不可能', () => {
    expect(isRetryableStatusCode(200)).toBe(false);
    expect(isRetryableStatusCode(301)).toBe(false);
    expect(isRetryableStatusCode(400)).toBe(false);
    expect(isRetryableStatusCode(401)).toBe(false);
    expect(isRetryableStatusCode(403)).toBe(false);
    expect(isRetryableStatusCode(404)).toBe(false);
  });
});

describe('isRetryableError', () => {
  it('ネットワークエラーはリトライ可能', () => {
    const errors = [
      new Error('ECONNRESET'),
      new Error('ETIMEDOUT'),
      new Error('ENOTFOUND'),
      new Error('ECONNREFUSED'),
      new Error('socket hang up'),
    ];

    for (const error of errors) {
      expect(isRetryableError(error)).toBe(true);
    }
  });

  it('一般的なエラーはリトライ不可能', () => {
    expect(isRetryableError(new Error('Unknown error'))).toBe(false);
    expect(isRetryableError(new Error('Parse error'))).toBe(false);
  });

  it('statusCode プロパティを持つエラーを処理する', () => {
    const retryableError = new Error('Server Error');
    (retryableError as any).statusCode = 503;
    expect(isRetryableError(retryableError)).toBe(true);

    const nonRetryableError = new Error('Not Found');
    (nonRetryableError as any).statusCode = 404;
    expect(isRetryableError(nonRetryableError)).toBe(false);
  });
});
