import {
  policy as dashboardPolicy,
  enhancedPolicy as dashboardEnhancedPolicy,
} from "./dashboard";

type ScreenPolicy = {
  policy: string;
  enhanced?: string;
};

export const SCREEN_POLICIES: Record<string, ScreenPolicy> = {
  "#dashboard": {
    policy: dashboardPolicy,
    enhanced: dashboardEnhancedPolicy,
  },
};

export function policyForHash(hash: string): string | null {
  return SCREEN_POLICIES[hash]?.policy ?? null;
}

export function enhancedPolicyForHash(hash: string): string | null {
  return SCREEN_POLICIES[hash]?.enhanced ?? null;
}
