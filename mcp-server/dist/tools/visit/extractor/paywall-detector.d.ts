/**
 * Paywall Detector
 * REQ-PAY-001: ペイウォール検知機能
 *
 * @remarks
 * - ペイウォールの種類を検出
 * - 代替アクセス方法を提案
 * - 部分コンテンツの割合を推定
 * - TSK-013 実装
 */
import type { PaywallDetectionResult } from './types.js';
/**
 * ペイウォール検知クラス
 */
export declare class PaywallDetector {
    private readonly paywallIndicators;
    private readonly paywallClasses;
    private readonly paywallElements;
    /**
     * ペイウォールを検知
     */
    detect(html: string, url: string): PaywallDetectionResult;
    /**
     * アクセス可能なコンテンツの割合を推定
     */
    private estimateAccessibleContent;
    /**
     * 代替アクセス方法の提案を生成
     */
    private generateSuggestions;
}
/**
 * PaywallDetectorのシングルトンインスタンスを取得
 */
export declare function getPaywallDetector(): PaywallDetector;
//# sourceMappingURL=paywall-detector.d.ts.map