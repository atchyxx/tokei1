/**
 * Search Provider Interface Types
 *
 * REQ-SRCH-001: 検索フォールバック機構
 * REQ-SRCH-002: 検索結果の健全性チェック
 */
/**
 * 検索プロバイダーのベースクラス
 */
export class BaseSearchProvider {
    config;
    priority;
    successCount = 0;
    errorCount = 0;
    lastSuccessTime;
    lastErrorTime;
    constructor(config) {
        this.config = config;
        this.priority = config.priority;
    }
    getHealthStatus() {
        const totalAttempts = this.successCount + this.errorCount;
        return {
            name: this.name,
            available: true, // サブクラスで上書き
            lastSuccessTime: this.lastSuccessTime,
            lastErrorTime: this.lastErrorTime,
            errorCount: this.errorCount,
            successRate: totalAttempts > 0 ? this.successCount / totalAttempts : 1,
        };
    }
    recordSuccess() {
        this.successCount++;
        this.lastSuccessTime = new Date();
    }
    recordError() {
        this.errorCount++;
        this.lastErrorTime = new Date();
    }
}
//# sourceMappingURL=types.js.map