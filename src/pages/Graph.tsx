import { useMemo, useState } from "react";
import type { BacklogItem, BacklogStatus } from "../lib/backlog";
import { OBJECTIVES_LITE, KRS, KR_BY_ID } from "../lib/krs";
import { cn } from "../lib/cn";

// ──────────────────────────────────────────────────────────────────────────
// Layout constants
// ──────────────────────────────────────────────────────────────────────────

const COL_X = { obj: 0, kr: 280, bl: 620 };
const COL_W = { obj: 220, kr: 280, bl: 320 };
const TOTAL_W = COL_X.bl + COL_W.bl;

const PADDING_TOP = 36;
const PADDING_BOTTOM = 40;

const KR_H = 36;
const KR_GAP = 6;
const OBJ_GROUP_GAP = 22;

const BL_H = 64;
const BL_GAP = 8;

const OBJ_COLOR: Record<string, string> = {
  "obj-activation": "#2563eb",
  "obj-revenue": "#1f8a4c",
  "obj-marketplace": "#7c6cff",
  "obj-mobile": "#c89211",
};

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

type ObjLayout = {
  id: string;
  short: string;
  full: string;
  emoji: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type KrLayout = {
  id: string;
  label: string;
  objectiveId: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type BlLayout = BacklogItem & {
  x: number;
  y: number;
  w: number;
  h: number;
};

type Edge = {
  fromId: string;
  toId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
};

type Props = {
  backlogs: BacklogItem[];
  onNavigate: (href: string) => void;
};

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export function Graph({ backlogs, onNavigate }: Props) {
  const [focusObj, setFocusObj] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const layout = useMemo(() => computeLayout(backlogs), [backlogs]);
  const edges = useMemo(() => computeEdges(layout), [layout]);

  const totalHeight =
    Math.max(
      layout.krs.length ? layout.krs[layout.krs.length - 1].y + KR_H : 0,
      layout.backlogs.length
        ? layout.backlogs[layout.backlogs.length - 1].y + BL_H
        : 0,
      layout.unaligned.length
        ? layout.unaligned[layout.unaligned.length - 1].y + BL_H
        : 0
    ) + PADDING_BOTTOM;

  const highlight = useMemo(() => {
    if (!hovered) return null;
    const set = new Set<string>([hovered]);
    let added = true;
    while (added) {
      added = false;
      for (const e of edges) {
        if (set.has(e.fromId) && !set.has(e.toId)) {
          set.add(e.toId);
          added = true;
        }
        if (set.has(e.toId) && !set.has(e.fromId)) {
          set.add(e.fromId);
          added = true;
        }
      }
    }
    return set;
  }, [hovered, edges]);

  const isDim = (id: string, objectiveIdOfNode?: string) => {
    if (focusObj && objectiveIdOfNode && objectiveIdOfNode !== focusObj)
      return true;
    if (focusObj && !objectiveIdOfNode) return true; // unaligned: dim when focused
    if (!highlight) return false;
    return !highlight.has(id);
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      {/* Focus chips */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="text-[12px] text-charcoal-muted">Focus</span>
        <ToggleChip
          active={focusObj === null}
          onClick={() => setFocusObj(null)}
          label="All"
        />
        {OBJECTIVES_LITE.map((o) => (
          <ToggleChip
            key={o.id}
            active={focusObj === o.id}
            onClick={() => setFocusObj(focusObj === o.id ? null : o.id)}
            label={o.short}
            color={OBJ_COLOR[o.id]}
          />
        ))}
      </div>

      {/* Canvas */}
      <div className="card overflow-auto">
        <div
          className="relative"
          style={{ width: TOTAL_W, height: totalHeight }}
        >
          {/* Column headers */}
          <ColumnHeader x={COL_X.obj} w={COL_W.obj} label="Objectives" />
          <ColumnHeader x={COL_X.kr} w={COL_W.kr} label="Key Results" />
          <ColumnHeader x={COL_X.bl} w={COL_W.bl} label="Backlogs" />

          {/* SVG edges */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={TOTAL_W}
            height={totalHeight}
          >
            {edges.map((e, i) => {
              const dimEdge =
                (hovered &&
                  !(highlight?.has(e.fromId) && highlight?.has(e.toId))) ||
                (focusObj &&
                  !edgeMatchesObjective(e, focusObj, layout, backlogs));
              return (
                <path
                  key={i}
                  d={pathCurve(e.fromX, e.fromY, e.toX, e.toY)}
                  fill="none"
                  stroke={e.color}
                  strokeWidth={1.4}
                  strokeOpacity={dimEdge ? 0.06 : 0.6}
                  className="transition-opacity"
                />
              );
            })}
          </svg>

          {/* Objective cards */}
          {layout.objectives.map((o) => {
            const color = OBJ_COLOR[o.id];
            return (
              <div
                key={o.id}
                onMouseEnter={() => setHovered(o.id)}
                onMouseLeave={() => setHovered((h) => (h === o.id ? null : h))}
                onClick={() => onNavigate("#okrs")}
                className={cn(
                  "absolute cursor-pointer overflow-hidden rounded-card border border-cream-light bg-cream transition",
                  isDim(o.id, o.id) ? "opacity-25" : "hover:shadow-focus"
                )}
                style={{ left: o.x, top: o.y, width: o.w, height: o.h }}
              >
                <div className="flex h-full items-stretch gap-2">
                  <div
                    className="w-1.5 shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 flex-1 px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px]">{o.emoji}</span>
                      <span className="text-[10.5px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
                        {o.short}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.35] text-charcoal">
                      {o.full}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* KR cards */}
          {layout.krs.map((kr) => {
            const color = OBJ_COLOR[kr.objectiveId];
            return (
              <div
                key={kr.id}
                onMouseEnter={() => setHovered(kr.id)}
                onMouseLeave={() =>
                  setHovered((h) => (h === kr.id ? null : h))
                }
                onClick={() => onNavigate("#okrs")}
                className={cn(
                  "absolute cursor-pointer overflow-hidden rounded-card border border-cream-light bg-cream transition",
                  isDim(kr.id, kr.objectiveId)
                    ? "opacity-25"
                    : "hover:shadow-focus"
                )}
                style={{ left: kr.x, top: kr.y, width: kr.w, height: kr.h }}
              >
                <div className="flex h-full items-center gap-2 pl-1.5 pr-2.5">
                  <span
                    className="h-full w-[3px] shrink-0 rounded-pill"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-[12.5px] text-charcoal">
                    {kr.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Backlog cards (aligned to a KR) */}
          {layout.backlogs.map((b) => {
            const krObj = b.krId ? KR_BY_ID[b.krId]?.objectiveId : undefined;
            const color = krObj ? OBJ_COLOR[krObj] : "#5f5f5d";
            return (
              <BacklogCard
                key={b.id}
                b={b}
                color={color}
                dim={isDim(b.id, krObj)}
                onHoverEnter={() => setHovered(b.id)}
                onHoverLeave={() =>
                  setHovered((h) => (h === b.id ? null : h))
                }
                onClick={() => onNavigate("#backlogs")}
              />
            );
          })}

          {/* Unaligned backlogs section */}
          {layout.unaligned.length > 0 && (
            <>
              <div
                className="absolute text-[11px] font-[480] uppercase tracking-[0.06em] text-[#b8443a]"
                style={{
                  left: COL_X.bl,
                  top: layout.unalignedHeaderY,
                  width: COL_W.bl,
                }}
              >
                ⚠ Unaligned (no KR)
              </div>
              {layout.unaligned.map((b) => (
                <BacklogCard
                  key={b.id}
                  b={b}
                  color="#b8443a"
                  dim={isDim(b.id, undefined)}
                  onHoverEnter={() => setHovered(b.id)}
                  onHoverLeave={() =>
                    setHovered((h) => (h === b.id ? null : h))
                  }
                  onClick={() => onNavigate("#backlogs")}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-charcoal-muted">
        <span className="font-[480]">Legend</span>
        {OBJECTIVES_LITE.map((o) => (
          <span key={o.id} className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: OBJ_COLOR[o.id] }}
            />
            {o.short}
          </span>
        ))}
        <span className="mx-1 h-3 w-px bg-cream-light" />
        <span>Hover로 연결 강조 · Focus 칩으로 한 목표만 보기</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function ColumnHeader({
  x,
  w,
  label,
}: {
  x: number;
  w: number;
  label: string;
}) {
  return (
    <div
      className="absolute text-[10.5px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted"
      style={{ left: x, top: 8, width: w }}
    >
      {label}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-pill border px-2.5 text-[12px] transition",
        active
          ? "border-transparent bg-charcoal text-charcoal-offwhite shadow-inset-dark"
          : "border-cream-light bg-cream text-charcoal hover:bg-[rgba(28,28,28,0.04)]"
      )}
    >
      {color && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </button>
  );
}

function BacklogCard({
  b,
  color,
  dim,
  onHoverEnter,
  onHoverLeave,
  onClick,
}: {
  b: BlLayout;
  color: string;
  dim: boolean;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
  onClick: () => void;
}) {
  return (
    <div
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      onClick={onClick}
      className={cn(
        "absolute cursor-pointer overflow-hidden rounded-card border border-cream-light bg-cream transition",
        dim ? "opacity-25" : "hover:shadow-focus"
      )}
      style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
    >
      <div className="flex h-full items-stretch gap-2">
        <div
          className="w-[3px] shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0 flex-1 px-2 py-1.5">
          <div className="flex items-center gap-1.5">
            <StatusDot status={b.status} />
            {b.sourceLabel && (
              <span className="rounded-pill border border-cream-light bg-cream px-1.5 py-0 text-[10px] uppercase tracking-[0.06em] text-charcoal-muted">
                {b.sourceLabel}
              </span>
            )}
            {b.agent && (
              <span className="rounded-pill border border-cream-light bg-cream px-1.5 py-0 text-[10px] text-charcoal">
                {b.agent}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-[12px] leading-[1.35] text-charcoal">
            {b.title}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: BacklogStatus }) {
  const color =
    status === "in_progress"
      ? "#2563eb"
      : status === "done"
      ? "#1f8a4c"
      : status === "pending"
      ? "#c89211"
      : "rgba(28,28,28,0.4)";
  return (
    <span
      className="h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Layout
// ──────────────────────────────────────────────────────────────────────────

function computeLayout(backlogs: BacklogItem[]) {
  // KRs grouped by objective
  let krY = PADDING_TOP;
  const krs: KrLayout[] = [];
  const objBands: Record<string, { topY: number; bottomY: number }> = {};

  for (const obj of OBJECTIVES_LITE) {
    const myKrs = KRS.filter((k) => k.objectiveId === obj.id);
    const startY = krY;
    for (const k of myKrs) {
      krs.push({
        id: k.id,
        label: k.label,
        objectiveId: k.objectiveId,
        x: COL_X.kr,
        y: krY,
        w: COL_W.kr,
        h: KR_H,
      });
      krY += KR_H + KR_GAP;
    }
    const endY = krY - KR_GAP;
    objBands[obj.id] = { topY: startY, bottomY: endY };
    krY += OBJ_GROUP_GAP;
  }

  // Objectives centered on their KR band
  const objectives: ObjLayout[] = OBJECTIVES_LITE.map((o) => {
    const band = objBands[o.id];
    const bandMid = (band.topY + band.bottomY) / 2;
    const h = 68;
    return {
      id: o.id,
      short: o.short,
      full: o.full,
      emoji: o.emoji,
      x: COL_X.obj,
      y: bandMid - h / 2,
      w: COL_W.obj,
      h,
    };
  });

  // Backlogs aligned next to their KR
  const backlogsLaid: BlLayout[] = [];
  const usedTopByY = new Map<number, number>(); // tracks rightmost y consumed
  let maxY = 0;
  for (const kr of krs) {
    const myBl = backlogs.filter((b) => b.krId === kr.id);
    if (myBl.length === 0) continue;
    let y = Math.max(kr.y, maxY);
    for (const b of myBl) {
      backlogsLaid.push({
        ...b,
        x: COL_X.bl,
        y,
        w: COL_W.bl,
        h: BL_H,
      });
      y += BL_H + BL_GAP;
    }
    maxY = y;
    usedTopByY.set(kr.y, y);
  }

  // Unaligned backlogs (no krId) — below everything
  const unalignedHeaderY = Math.max(maxY, krY) + OBJ_GROUP_GAP;
  const unaligned: BlLayout[] = [];
  let uY = unalignedHeaderY + 22;
  for (const b of backlogs.filter((bb) => !bb.krId)) {
    unaligned.push({
      ...b,
      x: COL_X.bl,
      y: uY,
      w: COL_W.bl,
      h: BL_H,
    });
    uY += BL_H + BL_GAP;
  }

  return {
    objectives,
    krs,
    backlogs: backlogsLaid,
    unaligned,
    unalignedHeaderY,
  };
}

function computeEdges(layout: ReturnType<typeof computeLayout>): Edge[] {
  const edges: Edge[] = [];
  const krById = new Map(layout.krs.map((k) => [k.id, k]));
  const objById = new Map(layout.objectives.map((o) => [o.id, o]));

  // Obj → KR
  for (const kr of layout.krs) {
    const obj = objById.get(kr.objectiveId);
    if (!obj) continue;
    edges.push({
      fromId: obj.id,
      toId: kr.id,
      fromX: obj.x + obj.w,
      fromY: obj.y + obj.h / 2,
      toX: kr.x,
      toY: kr.y + kr.h / 2,
      color: OBJ_COLOR[obj.id],
    });
  }

  // KR → Backlog
  for (const b of layout.backlogs) {
    if (!b.krId) continue;
    const kr = krById.get(b.krId);
    if (!kr) continue;
    edges.push({
      fromId: kr.id,
      toId: b.id,
      fromX: kr.x + kr.w,
      fromY: kr.y + kr.h / 2,
      toX: b.x,
      toY: b.y + b.h / 2,
      color: OBJ_COLOR[kr.objectiveId],
    });
  }

  return edges;
}

function pathCurve(fromX: number, fromY: number, toX: number, toY: number) {
  const dx = Math.max(40, (toX - fromX) * 0.5);
  return `M ${fromX} ${fromY} C ${fromX + dx} ${fromY}, ${toX - dx} ${toY}, ${toX} ${toY}`;
}

function edgeMatchesObjective(
  e: Edge,
  focusObj: string,
  layout: ReturnType<typeof computeLayout>,
  _backlogs: BacklogItem[]
): boolean {
  // Find objective for either endpoint
  const krsById = new Map(layout.krs.map((k) => [k.id, k]));
  const blsById = new Map(layout.backlogs.map((b) => [b.id, b]));

  const objIdOf = (id: string): string | undefined => {
    if (id.startsWith("obj-")) return id;
    if (id.startsWith("kr-")) return krsById.get(id)?.objectiveId;
    // backlog
    const b = blsById.get(id);
    if (b?.krId) return KR_BY_ID[b.krId]?.objectiveId;
    return undefined;
  };

  const fromObj = objIdOf(e.fromId);
  const toObj = objIdOf(e.toId);
  return fromObj === focusObj && toObj === focusObj;
}
