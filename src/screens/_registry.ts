import { policy as dashboardPolicy } from "./dashboard";

export const SCREEN_POLICIES: Record<string, string> = {
  "#dashboard": dashboardPolicy,
};

export function policyForHash(hash: string): string | null {
  return SCREEN_POLICIES[hash] ?? null;
}
