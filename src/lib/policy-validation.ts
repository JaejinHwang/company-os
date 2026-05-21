import { useEffect, useMemo, useState } from "react";

export type SelectorStatus =
  | { kind: "ok"; count: 1 }
  | { kind: "ambiguous"; count: number }
  | { kind: "not-found" }
  | { kind: "invalid"; error: string }
  | { kind: "none" };

export function validateSelector(
  selector: string | undefined,
  root: ParentNode = document
): SelectorStatus {
  if (!selector) return { kind: "none" };
  try {
    const found = root.querySelectorAll(selector);
    if (found.length === 0) return { kind: "not-found" };
    if (found.length === 1) return { kind: "ok", count: 1 };
    return { kind: "ambiguous", count: found.length };
  } catch (e) {
    return { kind: "invalid", error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Validates each item.selector against the live DOM under the prototype root.
 * Re-runs on prototype DOM mutation (so screen transitions / late mounts are
 * picked up automatically). Debounced 60ms to avoid mutation storms.
 */
export function useSelectorValidation<T extends { selector?: string }>(
  items: T[],
  rootSelector = '[aria-label="Prototype"]'
): SelectorStatus[] {
  const selectors = useMemo(() => items.map((i) => i.selector), [items]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) {
      // Prototype not mounted yet — trigger one re-check next frame.
      const id = requestAnimationFrame(() => setTick((v) => v + 1));
      return () => cancelAnimationFrame(id);
    }
    let timer: number | undefined;
    const reval = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setTick((v) => v + 1), 60);
    };
    const observer = new MutationObserver(reval);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    // Initial tick to make sure first pass uses live DOM.
    reval();
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [rootSelector]);

  return useMemo(() => {
    const root =
      document.querySelector(rootSelector) ?? document;
    return selectors.map((s) => validateSelector(s, root));
    // tick is intentionally in deps to force recompute on mutation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectors, rootSelector, tick]);
}
