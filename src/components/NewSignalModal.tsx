// New Signal composer — visual clone of NewIssueModal adapted to produce a Signal.
// Shares the same header / body / toolbar / footer structure so signal creation
// feels like a sibling action to issue creation.

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  X,
  Maximize2,
  ChevronRight,
  ChevronDown,
  Paperclip,
  Flame,
  MoreHorizontal,
  CircleDot,
} from "lucide-react";
import { cn } from "../lib/cn";
import {
  KR_BY_ID,
  OBJECTIVE_BY_ID,
  OBJECTIVES_LITE,
  KRS,
} from "../lib/krs";
import type { Signal, SignalSource, SignalStatus } from "../lib/signals";

const SOURCE_OPTIONS: Array<{
  value: SignalSource;
  label: string;
  color: string;
}> = [
  { value: "cs", label: "Customer Support", color: "#2563eb" },
  { value: "bug", label: "Bug Report", color: "#b8443a" },
  { value: "internal", label: "Internal Finding", color: "#5f5f5d" },
  { value: "competitor", label: "Competitor", color: "#c89211" },
  { value: "market", label: "Market Research", color: "#7c6cff" },
  { value: "sales", label: "Sales", color: "#1f8a4c" },
];

const STATUSES: Array<{ value: SignalStatus; label: string; color: string }> = [
  { value: "new", label: "New", color: "#2563eb" },
  { value: "triaging", label: "Triaging", color: "#c89211" },
  { value: "planned", label: "Planned", color: "#1f8a4c" },
];

let _signalSeq = 1000;
const nextSignalId = () => `s-u-${++_signalSeq}`;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (s: Signal) => void;
};

export function NewSignalModal({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [source, setSource] = useState<SignalSource | "">("");
  const [channel, setChannel] = useState("");
  const [krId, setKrId] = useState("");
  const [status, setStatus] = useState<SignalStatus>("new");
  const [hot, setHot] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => titleRef.current?.focus(), 40);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const reset = () => {
    setTitle("");
    setDetail("");
    setSource("");
    setChannel("");
    setKrId("");
    setStatus("new");
    setHot(false);
  };

  const handleSubmit = () => {
    if (!title.trim() || !source) return;
    const meta = SOURCE_OPTIONS.find((s) => s.value === source)!;
    onCreate({
      id: nextSignalId(),
      source,
      title: title.trim(),
      detail: detail.trim() || `Manually added · ${meta.label}`,
      channel: channel.trim() || `${meta.label} · manual`,
      timeAgo: "방금 전",
      status,
      hot,
      suggestedKrId: krId || undefined,
    });
    onClose();
    reset();
  };

  const handleDiscard = () => {
    reset();
    onClose();
  };

  const currentStatus = STATUSES.find((s) => s.value === status) ?? STATUSES[0];
  const currentSource = SOURCE_OPTIONS.find((s) => s.value === source);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-[10vh]">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-charcoal/25 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-signal-title"
        className="relative w-full max-w-2xl overflow-hidden rounded-container border border-cream-light bg-cream shadow-focus"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-cream-light px-5 py-2.5">
          <span className="rounded-md border border-cream-light bg-cream px-1.5 py-0.5 text-[10.5px] font-[480] uppercase tracking-[0.08em] text-charcoal">
            Signals
          </span>
          <ChevronRight
            className="h-3 w-3 text-charcoal-muted"
            strokeWidth={1.8}
          />
          <span
            id="new-signal-title"
            className="text-[13.5px] text-charcoal-muted"
          >
            New signal
          </span>
          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Expand"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-charcoal-muted transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
            >
              <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-charcoal-muted transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-4">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Signal title"
            className="w-full border-0 bg-transparent text-[26px] font-[480] tracking-[-0.4px] text-charcoal placeholder:text-charcoal/35 focus:outline-none"
          />

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[13.5px] text-charcoal-muted">
            <span>From</span>
            <InlineSelect
              value={source}
              onChange={(v) => setSource(v as SignalSource | "")}
              options={SOURCE_OPTIONS.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
              placeholder="Source"
            />
            <span>via</span>
            <InlineInput
              value={channel}
              onChange={setChannel}
              placeholder={
                currentSource ? `${currentSource.label} · channel` : "Channel"
              }
            />
            <button
              type="button"
              aria-label="More fields"
              className="ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-charcoal-muted transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
            >
              <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[13.5px] text-charcoal-muted">
            <span>Toward</span>
            <KrSelect value={krId} onChange={setKrId} />
            <span className="text-[11.5px] text-charcoal-muted">
              {krId ? "·  KR 연결됨" : "·  KR은 선택 사항"}
            </span>
          </div>

          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Add detail — 배경, 데이터, 출처…"
            rows={5}
            className="mt-4 w-full resize-none border-0 bg-transparent text-[15px] leading-[1.55] text-charcoal placeholder:text-charcoal/40 focus:outline-none"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-cream-light px-5 py-3">
          <SelectPill
            value={status}
            onChange={(v) => setStatus(v as SignalStatus)}
            options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            icon={
              <CircleDot
                className="h-3.5 w-3.5"
                style={{ color: currentStatus.color }}
                strokeWidth={1.8}
              />
            }
            displayLabel={currentStatus.label}
          />
          <ToggleablePill
            active={hot}
            onClick={() => setHot(!hot)}
            icon={
              <Flame
                className={cn(
                  "h-3.5 w-3.5",
                  hot ? "text-[#b8443a]" : "text-charcoal-muted"
                )}
                strokeWidth={1.8}
              />
            }
          >
            {hot ? "Escalating" : "Escalate"}
          </ToggleablePill>
          <Pill
            icon={
              <Paperclip
                className="h-3.5 w-3.5 text-charcoal-muted"
                strokeWidth={1.8}
              />
            }
          >
            Upload
          </Pill>
          <button
            type="button"
            aria-label="More options"
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill border border-cream-light bg-cream text-charcoal-muted transition hover:text-charcoal"
          >
            <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-cream-light px-5 py-3">
          <button
            type="button"
            onClick={handleDiscard}
            className="text-[13.5px] text-charcoal-muted transition hover:text-charcoal"
          >
            Discard Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || !source}
            className={cn(
              "btn-primary h-9 px-4 text-[14px]",
              (!title.trim() || !source) && "cursor-not-allowed opacity-50"
            )}
            title={
              !title.trim()
                ? "제목을 입력해주세요"
                : !source
                ? "Source를 선택해주세요"
                : undefined
            }
          >
            Create Signal
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Local helpers (mirroring NewIssueModal primitives so visuals stay identical)
// ──────────────────────────────────────────────────────────────────────────────

function Pill({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-7 items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2.5 text-[13px] text-charcoal transition hover:bg-[rgba(28,28,28,0.04)]"
    >
      {icon}
      {children}
    </button>
  );
}

function ToggleablePill({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-pill border px-2.5 text-[13px] transition",
        active
          ? "border-[rgba(184,68,58,0.35)] bg-[rgba(184,68,58,0.08)] text-[#b8443a]"
          : "border-cream-light bg-cream text-charcoal hover:bg-[rgba(28,28,28,0.04)]"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function InlineSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-md border border-cream-light bg-cream py-1 pl-2.5 pr-7 text-[13px] focus:outline-none focus-visible:shadow-focus",
          value ? "text-charcoal" : "text-charcoal-muted"
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-charcoal-muted"
        strokeWidth={1.8}
      />
    </div>
  );
}

function InlineInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-48 rounded-md border border-cream-light bg-cream px-2.5 py-1 text-[13px] text-charcoal placeholder:text-charcoal-muted focus:outline-none focus-visible:shadow-focus"
    />
  );
}

function KrSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const selected = value ? KR_BY_ID[value] : undefined;
  const selectedObj = selected
    ? OBJECTIVE_BY_ID[selected.objectiveId]
    : undefined;

  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-md border border-cream-light bg-cream py-1 pl-2.5 pr-7 text-[13px] focus:outline-none focus-visible:shadow-focus",
          value ? "text-charcoal" : "text-charcoal-muted"
        )}
        title={
          selected ? `${selectedObj?.full} · ${selected.label}` : "KR 선택"
        }
      >
        <option value="">Key Result (optional)</option>
        {OBJECTIVES_LITE.map((obj) => (
          <optgroup
            key={obj.id}
            label={`${obj.emoji}  ${obj.short} — ${obj.full}`}
          >
            {KRS.filter((k) => k.objectiveId === obj.id).map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-charcoal-muted"
        strokeWidth={1.8}
      />
    </div>
  );
}

function SelectPill({
  value,
  onChange,
  options,
  icon,
  displayLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: ReactNode;
  displayLabel: string;
}) {
  return (
    <div className="relative inline-flex">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
        {icon}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-pill border border-cream-light bg-cream py-1.5 pl-7 pr-3 text-[13px] text-charcoal focus:outline-none focus-visible:shadow-focus"
      >
        {!value && (
          <option value="" disabled>
            {displayLabel}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
