import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  X,
  Maximize2,
  ChevronRight,
  ChevronDown,
  Paperclip,
  Hammer,
  MoreHorizontal,
  CircleDot,
  Minus,
} from "lucide-react";
import { cn } from "../lib/cn";
import {
  KR_BY_ID,
  OBJECTIVE_BY_ID,
  OBJECTIVES_LITE,
  KRS,
} from "../lib/krs";

const ASSIGNEE_GROUPS = [
  { label: "People", options: ["Hanna Kim", "Min Park", "Jazz Hwang"] },
  {
    label: "Agents",
    options: ["CEO", "CTO", "UXDesigner", "Marketer", "Engineer"],
  },
];

const PROJECTS = [
  "Onboarding flow v2",
  "Pricing & billing rework",
  "Mobile app launch",
  "Customer health score",
  "AI agent marketplace",
];

const PRODUCTS = ["Sprint", "Inbox", "Routines", "Agents Cloud"];

const STATUSES = [
  { value: "todo", label: "Todo", color: "#2563eb" },
  { value: "in_progress", label: "In progress", color: "#2563eb" },
  { value: "pending", label: "Pending", color: "#c89211" },
  { value: "done", label: "Done", color: "#1f8a4c" },
];

const PRIORITIES = ["No priority", "Urgent", "High", "Medium", "Low"];

export type NewIssueSeed = {
  title?: string;
  description?: string;
  sourceLabel?: string;
  krId?: string;
};

export type NewIssuePayload = {
  title: string;
  description: string;
  assignee: string;
  project: string;
  product: string;
  krId: string;
  status: string;
  priority: string;
  sourceLabel?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  seed?: NewIssueSeed;
  onCreate?: (payload: NewIssuePayload) => void;
};

export function NewIssueModal({ open, onClose, seed, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [project, setProject] = useState("");
  const [product, setProduct] = useState("");
  const [krId, setKrId] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("");

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setTitle(seed?.title ?? "");
      setDescription(seed?.description ?? "");
      setKrId(seed?.krId ?? "");
      const t = setTimeout(() => titleRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open, seed]);

  if (!open) return null;

  const handleSubmit = () => {
    onCreate?.({
      title,
      description,
      assignee,
      project,
      product,
      krId,
      status,
      priority,
      sourceLabel: seed?.sourceLabel,
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignee("");
    setProject("");
    setProduct("");
    setKrId("");
    setStatus("todo");
    setPriority("");
  };

  const handleDiscard = () => {
    resetForm();
    onClose();
  };

  const currentStatus = STATUSES.find((s) => s.value === status) ?? STATUSES[0];

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center px-4 py-[10vh]">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-charcoal/25 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-issue-title"
        className="relative w-full max-w-2xl overflow-hidden rounded-container border border-cream-light bg-cream shadow-focus"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-cream-light px-5 py-2.5">
          <span className="rounded-md border border-cream-light bg-cream px-1.5 py-0.5 text-[10.5px] font-[480] uppercase tracking-[0.08em] text-charcoal">
            Sprint
          </span>
          <ChevronRight
            className="h-3 w-3 text-charcoal-muted"
            strokeWidth={1.8}
          />
          <span
            id="new-issue-title"
            className="text-[13.5px] text-charcoal-muted"
          >
            New issue
          </span>
          {seed?.sourceLabel && (
            <>
              <ChevronRight
                className="h-3 w-3 text-charcoal-muted"
                strokeWidth={1.8}
              />
              <span className="truncate text-[13px] text-charcoal-muted">
                from {seed.sourceLabel}
              </span>
            </>
          )}
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
            placeholder="Issue title"
            className="w-full border-0 bg-transparent text-[26px] font-[480] tracking-[-0.4px] text-charcoal placeholder:text-charcoal/35 focus:outline-none"
          />

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[13.5px] text-charcoal-muted">
            <span>For</span>
            <InlineSelect
              value={assignee}
              onChange={setAssignee}
              groups={ASSIGNEE_GROUPS}
              placeholder="Assignee"
            />
            <span>in</span>
            <InlineSelect
              value={project}
              onChange={setProject}
              options={PROJECTS}
              placeholder="Project"
            />
            <span>on</span>
            <InlineSelect
              value={product}
              onChange={setProduct}
              options={PRODUCTS}
              placeholder="Product"
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
            <span
              className={cn(
                "text-[11.5px]",
                krId ? "text-charcoal-muted" : "text-[#b8443a]"
              )}
              title="모든 이슈는 Key Result에 연결되어야 합니다"
            >
              {krId ? "·  KR 연결됨" : "·  KR 연결 필수"}
            </span>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description…"
            rows={5}
            className="mt-4 w-full resize-none border-0 bg-transparent text-[15px] leading-[1.55] text-charcoal placeholder:text-charcoal/40 focus:outline-none"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-cream-light px-5 py-3">
          <SelectPill
            value={status}
            onChange={setStatus}
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
          <SelectPill
            value={priority}
            onChange={setPriority}
            options={PRIORITIES.map((p) => ({ value: p, label: p }))}
            icon={
              <Minus
                className="h-3.5 w-3.5 text-charcoal-muted"
                strokeWidth={2.2}
              />
            }
            displayLabel={priority || "Priority"}
          />
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
          <Pill
            icon={
              <Hammer
                className="h-3.5 w-3.5 text-charcoal-muted"
                strokeWidth={1.8}
              />
            }
          >
            Standard
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
            disabled={!title.trim() || !krId}
            className={cn(
              "btn-primary h-9 px-4 text-[14px]",
              (!title.trim() || !krId) && "cursor-not-allowed opacity-50"
            )}
            title={
              !title.trim()
                ? "제목을 입력해주세요"
                : !krId
                ? "Toward [KR]을 선택해주세요"
                : undefined
            }
          >
            Create Issue
          </button>
        </div>
      </div>
    </div>
  );
}

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

function InlineSelect({
  value,
  onChange,
  options,
  groups,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
  groups?: { label: string; options: string[] }[];
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
        {options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        {groups?.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((o) => (
              <option key={o} value={o}>
                {o}
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
          "appearance-none rounded-md border bg-cream py-1 pl-2.5 pr-7 text-[13px] focus:outline-none focus-visible:shadow-focus",
          value
            ? "border-cream-light text-charcoal"
            : "border-[rgba(184,68,58,0.35)] text-charcoal-muted"
        )}
        title={selected ? `${selectedObj?.full} · ${selected.label}` : "KR 선택"}
      >
        <option value="" disabled>
          Key Result
        </option>
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
