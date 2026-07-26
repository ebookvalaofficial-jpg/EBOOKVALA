/**
 * Analytics Utility for EbookVala
 * Provides tracking hooks & functions for Google Analytics & Microsoft Clarity
 */

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "";

export const trackPageView = (url: string): void => {
  try {
    if (typeof window !== "undefined" && (window as unknown as { gtag?: Function }).gtag) {
      (window as unknown as { gtag: Function }).gtag("config", GA_TRACKING_ID, {
        page_path: url,
      });
    } else {
      console.log(`[Analytics] PageView: ${url}`);
    }
  } catch (err) {
    // Fail silently when analytics is blocked by privacy browsers / Brave Shields
  }
};

export const trackEvent = ({ action, category, label, value }: AnalyticsEvent): void => {
  try {
    if (typeof window !== "undefined" && (window as unknown as { gtag?: Function }).gtag) {
      (window as unknown as { gtag: Function }).gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    } else {
      console.log(`[Analytics] Event:`, { action, category, label, value });
    }
  } catch (err) {
    // Fail silently when analytics is blocked by privacy browsers / Brave Shields
  }
};

export const trackCTAClick = (ctaName: string, location: string): void => {
  try {
    trackEvent({
      action: "cta_click",
      category: "engagement",
      label: `${ctaName} - ${location}`,
    });
  } catch (err) {
    // Fail silently when analytics is blocked
  }
};
