import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Maximize2, Minimize2, PanelRightClose } from "lucide-react";
import type { Components } from "react-markdown";
import { MarkdownView } from "./MarkdownView";
import { SectionView } from "./policy-blocks/SectionView";
import { ScenariosBlock } from "./policy-blocks/ScenariosBlock";
import { ScreenStatesBlock } from "./policy-blocks/ScreenStatesBlock";
import { UxRequirementsBlock } from "./policy-blocks/UxRequirementsBlock";
import { parsePolicy } from "../lib/policy-parsing";
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
            ? renderParsed(parsed, activeTab)
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
  activeTab: TabId
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
