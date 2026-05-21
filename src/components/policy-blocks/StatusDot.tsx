import type { SelectorStatus } from "../../lib/policy-validation";

type Tone = "zone" | "interaction";

type Props = {
  status: SelectorStatus;
  tone?: Tone;
};

/**
 * Visual badge for a selector binding's health.
 * Zone tone treats `ambiguous` as a warning (zones should match exactly 1).
 * Interaction tone treats `ambiguous` as info (multiple triggers may be OK).
 */
export function StatusDot({ status, tone = "zone" }: Props) {
  const { color, ring, label } = describe(status, tone);
  return (
    <span
      title={label}
      aria-label={label}
      className={
        "inline-flex h-2 w-2 shrink-0 rounded-full ring-2 ring-offset-1 " +
        color +
        " " +
        ring
      }
    />
  );
}

function describe(
  status: SelectorStatus,
  tone: Tone
): { color: string; ring: string; label: string } {
  switch (status.kind) {
    case "ok":
      return {
        color: "bg-emerald-500",
        ring: "ring-emerald-500/20",
        label: "selector 정상 (1개 매칭)",
      };
    case "ambiguous":
      if (tone === "interaction") {
        return {
          color: "bg-sky-500",
          ring: "ring-sky-500/20",
          label: `${status.count}개 매칭 (다중 trigger)`,
        };
      }
      return {
        color: "bg-amber-500",
        ring: "ring-amber-500/20",
        label: `${status.count}개 매칭 — zone은 1개만 매칭되어야 합니다`,
      };
    case "not-found":
      return {
        color: "bg-amber-500",
        ring: "ring-amber-500/20",
        label: "selector 미연결 — 좌측 DOM에서 찾지 못함",
      };
    case "invalid":
      return {
        color: "bg-red-500",
        ring: "ring-red-500/20",
        label: `잘못된 selector: ${status.error}`,
      };
    case "none":
      return {
        color: "bg-charcoal/25",
        ring: "ring-charcoal/10",
        label: "selector 미작성 — 좌측 연동 비활성",
      };
  }
}
