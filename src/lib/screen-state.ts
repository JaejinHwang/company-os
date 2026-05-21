import { useMemo, useSyncExternalStore } from "react";
import type { StateDef } from "./policy-parsing";

/**
 * Per-screen state store.
 *
 * - `setScreenState(hash, stateId, value)` updates the active option for
 *   a given state on a given screen.
 * - `useScreenStateValue(hash, stateId)` reads the current value (live).
 * - `useScreenStateProps(hash, states)` merges every "real" binding's
 *   props patch into a single object that the parent (App / ScreenLayout)
 *   can spread onto the screen component.
 *
 * The store is intentionally in-memory only — option changes do not
 * persist across full reloads. Cleanup is handled by StateControl on
 * unmount so policy panel close/tab switch resets to defaults.
 */

type ScreenMap = Map<string, string>; // stateId -> active value
const store: Map<string, ScreenMap> = new Map();
let revision = 0;
const listeners = new Set<() => void>();

function emit() {
  revision += 1;
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function setScreenState(
  hash: string,
  stateId: string,
  value: string
): void {
  let m = store.get(hash);
  if (!m) {
    m = new Map();
    store.set(hash, m);
  }
  if (m.get(stateId) === value) return;
  m.set(stateId, value);
  emit();
}

export function clearScreenState(hash: string, stateId: string): void {
  const m = store.get(hash);
  if (!m) return;
  if (!m.has(stateId)) return;
  m.delete(stateId);
  emit();
}

function snapshotValue(hash: string, stateId: string): string | undefined {
  return store.get(hash)?.get(stateId);
}

export function useScreenStateValue(
  hash: string,
  stateId: string
): string | undefined {
  return useSyncExternalStore(
    subscribe,
    () => snapshotValue(hash, stateId),
    () => undefined
  );
}

function snapshotRevision(): number {
  return revision;
}

function useRevision(): number {
  return useSyncExternalStore(subscribe, snapshotRevision, () => 0);
}

/**
 * Merge every "real"-bound state's props patch into a single object.
 *
 * For each StateDef whose binding.kind is "real" (or has a valueMap), look
 * up the current active value (falling back to default) and merge that
 * option's patch from binding.valueMap. Later states overwrite earlier ones.
 */
export function useScreenStateProps(
  hash: string,
  states: StateDef[]
): Record<string, unknown> {
  const rev = useRevision();
  return useMemo(() => {
    const stateMap = store.get(hash);
    let merged: Record<string, unknown> = {};
    for (const state of states) {
      const binding = state.binding;
      if (!binding) continue;
      const kind = binding.kind ?? (binding.valueMap ? "real" : "visual");
      if (kind !== "real") continue;
      if (!binding.valueMap) continue;
      const current = stateMap?.get(state.id) ?? state.default;
      const patch = binding.valueMap[current];
      if (patch && typeof patch === "object") {
        merged = { ...merged, ...patch };
      }
    }
    return merged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, states, rev]);
}
