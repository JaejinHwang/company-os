import { PanelRightOpen } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { PolicyPanel } from "./PolicyPanel";

type Props = {
  children: ReactNode;
  policy: string | null;
  enhancedPolicy: string | null;
  policyOpen: boolean;
  policyFullscreen: boolean;
  screenTitle: string;
  onTogglePolicy: () => void;
  onTogglePolicyFullscreen: () => void;
};

/**
 * Top-level split view: prototype (left) | policy renderer (right).
 * Policy panel collapses to a 36px rail when closed, expands to 400px when
 * open, or takes the full width when fullscreen.
 */
export function ScreenLayout({
  children,
  policy,
  enhancedPolicy,
  policyOpen,
  policyFullscreen,
  screenTitle,
  onTogglePolicy,
  onTogglePolicyFullscreen,
}: Props) {
  return (
    <div className="flex h-screen w-screen gap-3 overflow-hidden bg-charcoal/10 p-3">
      <section
        aria-label="Prototype"
        className={cn(
          "flex min-w-0 flex-1 overflow-hidden rounded-xl bg-cream shadow-sm ring-1 ring-charcoal/5",
          policyFullscreen && policyOpen && "hidden"
        )}
      >
        {children}
      </section>
      <aside
        aria-label="Policy"
        className={cn(
          "flex shrink-0 flex-col overflow-hidden rounded-xl shadow-sm ring-1 transition-[width] duration-200",
          policyOpen
            ? policyFullscreen
              ? "flex-1 bg-white ring-charcoal/10"
              : "w-[400px] bg-white ring-charcoal/10"
            : "w-8 bg-cream-light ring-charcoal/10"
        )}
      >
        {policyOpen ? (
          <PolicyPanel
            policy={policy}
            enhanced={enhancedPolicy}
            screenTitle={screenTitle}
            fullscreen={policyFullscreen}
            onClose={onTogglePolicy}
            onToggleFullscreen={onTogglePolicyFullscreen}
          />
        ) : (
          <button
            type="button"
            onClick={onTogglePolicy}
            aria-label="Open policy panel"
            title="Open policy (⌘\\)"
            className="flex h-full w-full items-center justify-center text-charcoal/55 transition hover:bg-cream hover:text-charcoal"
          >
            <PanelRightOpen className="h-4 w-4" strokeWidth={1.7} />
          </button>
        )}
      </aside>
    </div>
  );
}
