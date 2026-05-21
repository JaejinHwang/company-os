import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Crosshair,
  Maximize2,
  Minimize2,
  PanelRightClose,
} from "lucide-react";
import type { Components } from "react-markdown";
import { MarkdownView } from "./MarkdownView";
import { SectionView } from "./policy-blocks/SectionView";
import { ScenariosBlock } from "./policy-blocks/ScenariosBlock";
import { ScreenStatesBlock } from "./policy-blocks/ScreenStatesBlock";
import { UxRequirementsBlock } from "./policy-blocks/UxRequirementsBlock";
import { parsePolicy, type SectionDef } from "../lib/policy-parsing";
import { cn } from "../lib/cn";

type Props = {
  policy: string | null;
  screenTitle: string;
  fullscreen: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
};

type TabId = "overview" | string;

const OVERVIEW_COMPONENTS: Components = {
  pre: ({ children, ...rest }) => {
    const code = children as ReactElement<{
      className?: string;
      children?: ReactNode;
    }>;
    const className = code?.props?.className ?? "";
    const lang = /language-([\w-]+)/.exec(className)?.[1];
    const raw = String(code?.props?.children ?? "").replace(/\n$/, "");
    if (lang === "scenarios") return <ScenariosBlock source={raw} />;
    if (lang === "ux-requirements")
      return <UxRequirementsBlock source={raw} />;
    if (lang === "states") return <ScreenStatesBlock source={raw} />;
    return <pre {...rest}>{children}</pre>;
  },
};

export function PolicyPanel({
  policy,
  screenTitle,
  fullscreen,
  onClose,
  onToggleFullscreen,
}: Props) {
  const parsed = useMemo(
    () => (policy ? parsePolicy(policy) : null),
    [policy]
  );

  const tabs = useMemo<{ id: TabId; label: string }[]>(() => {
    if (!parsed) return [];
    const out: { id: TabId; label: string }[] = [];
    if (parsed.preface || parsed.overview || parsed.crossCutting) {
      out.push({ id: "overview", label: "Overview" });
    }
    parsed.sections.forEach((s) => out.push({ id: s.id, label: s.name }));
    return out;
  }, [parsed]);

  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    if (tabs.length > 0) {
      const exists = tabs.some((t) => t.id === activeTab);
      if (!exists) setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-charcoal/10 bg-white px-5">
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <h2 className="truncate text-[17px] font-[480] tracking-[-0.3px] text-charcoal">
            {screenTitle}
          </h2>
          <span className="shrink-0 text-[12px] font-medium uppercase tracking-[0.12em] text-charcoal/45">
            · Policy
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-charcoal/60 transition hover:bg-charcoal/5 hover:text-charcoal"
        >
          {fullscreen ? (
            <Minimize2 className="h-5 w-5" strokeWidth={1.6} />
          ) : (
            <Maximize2 className="h-5 w-5" strokeWidth={1.6} />
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close policy panel"
          title="Close policy (⌘\\)"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-charcoal/60 transition hover:bg-charcoal/5 hover:text-charcoal"
        >
          <PanelRightClose className="h-5 w-5" strokeWidth={1.6} />
        </button>
      </header>

      {tabs.length > 1 && (
        <nav
          aria-label="Policy tabs"
          className="flex shrink-0 gap-0 overflow-x-auto border-b border-charcoal/10 bg-white px-3"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              aria-pressed={activeTab === t.id}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-[12.5px] font-medium transition",
                activeTab === t.id
                  ? "text-charcoal"
                  : "text-charcoal/50 hover:text-charcoal/75"
              )}
            >
              {t.label}
              {activeTab === t.id && (
                <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-t bg-charcoal" />
              )}
            </button>
          ))}
        </nav>
      )}

      <div ref={bodyRef} className="flex-1 overflow-y-auto">
        <div
          className={cn(
            "py-6",
            fullscreen ? "mx-auto max-w-[900px] px-10" : "px-6"
          )}
        >
          {parsed
            ? renderParsed(parsed, activeTab, setActiveTab)
            : renderEmpty()}
        </div>
      </div>
    </div>
  );
}

function renderEmpty(): ReactNode {
  return (
    <div className="rounded-lg border border-dashed border-charcoal/15 px-4 py-6 text-center text-sm text-charcoal/50">
      이 화면의 정책 문서는 아직 작성되지 않았습니다.
    </div>
  );
}

function renderParsed(
  parsed: ReturnType<typeof parsePolicy>,
  activeTab: TabId,
  onNavigateTab: (id: TabId) => void
): ReactNode {
  if (activeTab === "overview") {
    return (
      <div className="space-y-8">
        {parsed.preface && <MarkdownView source={parsed.preface} />}
        {parsed.overview && (
          <MarkdownView
            source={parsed.overview}
            components={OVERVIEW_COMPONENTS}
          />
        )}
        {parsed.sections.length > 0 && (
          <SectionsOverview
            sections={parsed.sections}
            onNavigateTab={onNavigateTab}
          />
        )}
        {parsed.crossCutting && (
          <div className="border-t border-charcoal/10 pt-6">
            <MarkdownView
              source={parsed.crossCutting}
              components={OVERVIEW_COMPONENTS}
            />
          </div>
        )}
      </div>
    );
  }
  const section = parsed.sections.find((s) => s.id === activeTab);
  if (!section) return null;
  return <SectionView section={section} />;
}

function SectionsOverview({
  sections,
  onNavigateTab,
}: {
  sections: SectionDef[];
  onNavigateTab: (id: TabId) => void;
}) {
  return (
    <section>
      <header className="mb-2 flex items-baseline gap-2">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/65">
          Sections
        </h4>
        <span className="text-[11px] text-charcoal/45">
          — 이 화면을 구성하는 영역 ({sections.length})
        </span>
      </header>
      <ul className="space-y-2">
        {sections.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onNavigateTab(s.id)}
              onMouseEnter={() => highlightSelector(s.selector, true)}
              onMouseLeave={() => highlightSelector(s.selector, false)}
              className="group flex w-full items-start gap-2.5 rounded-md border border-charcoal/10 bg-charcoal/[0.02] px-3 py-2.5 text-left transition hover:border-[#2563eb]/40 hover:bg-[#2563eb]/[0.04]"
            >
              <Crosshair
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-charcoal/35 group-hover:text-[#2563eb]"
                strokeWidth={1.7}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-charcoal">
                    {s.name}
                  </span>
                  <span className="text-[11px] text-charcoal/45">
                    {sectionMetaLine(s)}
                  </span>
                </div>
                {s.summary && (
                  <p className="mt-0.5 text-[12.5px] leading-snug text-charcoal/65">
                    {s.summary}
                  </p>
                )}
              </div>
              <ArrowRight
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-charcoal/30 transition group-hover:translate-x-0.5 group-hover:text-[#2563eb]"
                strokeWidth={1.8}
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function sectionMetaLine(s: SectionDef): string {
  const parts: string[] = [];
  const c = s.components?.length ?? 0;
  const i = s.interactions?.length ?? 0;
  const r = s.rules?.length ?? 0;
  const st = s.states?.length ?? 0;
  if (c) parts.push(`${c} 컴포넌트`);
  if (i) parts.push(`${i} 인터랙션`);
  if (r) parts.push(`${r} 룰`);
  if (st) parts.push(`${st} state`);
  return parts.length ? `· ${parts.join(" · ")}` : "";
}

function highlightSelector(selector: string | undefined, on: boolean) {
  if (!selector) return;
  try {
    document
      .querySelectorAll(selector)
      .forEach((el) => el.classList.toggle("policy-zone-highlight", on));
  } catch {
    // invalid selector
  }
}
