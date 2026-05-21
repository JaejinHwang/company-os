import { PanelRightOpen } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { PolicyPanel } from "./PolicyPanel";

type Props = {
  children: ReactNode;
  policy: string | null;
  policyOpen: boolean;
  policyFullscreen: boolean;
  screenTitle: string;
  screenHash: string;
  onTogglePolicy: () => void;
  onTogglePolicyFullscreen: () => void;
};

const POLICY_WIDTH_KEY = "policy-panel-width";
const DEFAULT_POLICY_WIDTH = 400;
const MIN_POLICY_WIDTH = 280;
const MIN_LEFT_WIDTH = 360;

function readStoredWidth(): number {
  if (typeof window === "undefined") return DEFAULT_POLICY_WIDTH;
  const raw = window.localStorage.getItem(POLICY_WIDTH_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= MIN_POLICY_WIDTH ? n : DEFAULT_POLICY_WIDTH;
}

/**
 * Top-level split view: prototype (left) | policy renderer (right).
 * Policy panel collapses to a 32px rail when closed, expands to a
 * user-resizable width (default 400px) when open, or takes the full
 * width when fullscreen. A draggable handle sits between the two
 * panels when the policy panel is open and not fullscreen.
 */
export function ScreenLayout({
  children,
  policy,
  policyOpen,
  policyFullscreen,
  screenTitle,
  screenHash,
  onTogglePolicy,
  onTogglePolicyFullscreen,
}: Props) {
  const [policyWidth, setPolicyWidth] = useState<number>(readStoredWidth);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; width: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragStartRef.current = { x: e.clientX, width: policyWidth };
      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [policyWidth]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    // Policy panel is on the right, so dragging left grows it.
    const next = start.width - dx;
    const maxWidth = Math.max(MIN_POLICY_WIDTH, window.innerWidth - MIN_LEFT_WIDTH);
    const clamped = Math.min(Math.max(next, MIN_POLICY_WIDTH), maxWidth);
    setPolicyWidth(clamped);
  }, []);

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStartRef.current) return;
      dragStartRef.current = null;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer may already be released */
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.localStorage.setItem(POLICY_WIDTH_KEY, String(policyWidth));
    },
    [policyWidth]
  );

  const sectionHidden = policyFullscreen && policyOpen;
  const showHandle = policyOpen && !policyFullscreen;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-charcoal/10 p-3">
      <section
        aria-label="Prototype"
        className={cn(
          "relative flex min-w-0 flex-1 overflow-hidden rounded-xl bg-cream shadow-sm ring-1 ring-charcoal/5",
          sectionHidden && "hidden"
        )}
      >
        {children}
      </section>

      {showHandle ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize policy panel"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="group flex w-3 shrink-0 cursor-col-resize items-center justify-center"
        >
          <div
            className={cn(
              "h-10 w-[3px] rounded-full bg-charcoal/15 transition-colors",
              "group-hover:bg-charcoal/40",
              isDragging && "bg-charcoal/60"
            )}
          />
        </div>
      ) : (
        <div className={cn("w-3 shrink-0", sectionHidden && "hidden")} aria-hidden />
      )}

      <aside
        aria-label="Policy"
        style={policyOpen && !policyFullscreen ? { width: policyWidth } : undefined}
        className={cn(
          "flex shrink-0 flex-col overflow-hidden rounded-xl shadow-sm ring-1",
          !isDragging && "transition-[width] duration-200",
          policyOpen
            ? policyFullscreen
              ? "flex-1 bg-white ring-charcoal/10"
              : "bg-white ring-charcoal/10"
            : "w-8 bg-cream-light ring-charcoal/10"
        )}
      >
        {policyOpen ? (
          <PolicyPanel
            policy={policy}
            screenTitle={screenTitle}
            screenHash={screenHash}
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
