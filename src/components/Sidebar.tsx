import { useState, type ComponentType, type CSSProperties } from "react";
import {
  SquarePen,
  LayoutGrid,
  Inbox,
  CircleDot,
  Repeat,
  Target,
  Radio,
  Layers,
  Bot,
  BrainCircuit,
  Gem,
  Megaphone,
  Wrench,
  Network,
  Boxes,
  DollarSign,
  History,
  Settings as SettingsIcon,
  ChevronsUpDown,
  ChevronDown,
  Plus,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Grid2x2,
  Workflow,
  Aperture,
  ShieldCheck,
  LineChart,
  FlaskConical,
  Circle,
  CircleDashed,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "../lib/cn";
import { AtlasAvatar } from "./AtlasAvatar";
import { PersonAvatar } from "./PersonAvatar";
import {
  AGENT_STATUS_CONFIG,
  AGENT_STATUSES,
  type AgentStatus,
} from "../lib/agents";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

type ItemStatus = "todo" | "pending" | "in_progress" | "done";

type NavItem = {
  label: string;
  href: string;
  icon?: IconType;
  avatar?: string;
  badge?: string;
  dotColor?: string;
  kebab?: boolean;
  description?: string;
  status?: ItemStatus;
  agentStatus?: AgentStatus;
  children?: NavItem[];
};

const STATUS_CONFIG: Record<
  ItemStatus,
  { icon: IconType; color: string; label: string }
> = {
  todo: {
    icon: Circle,
    color: "rgba(28,28,28,0.4)",
    label: "Todo",
  },
  pending: {
    icon: CircleDashed,
    color: "#c89211",
    label: "Pending",
  },
  in_progress: {
    icon: CircleDot,
    color: "#2563eb",
    label: "In progress",
  },
  done: {
    icon: CheckCircle2,
    color: "#1f8a4c",
    label: "Done",
  },
};

type Section = {
  id: string;
  label?: string;
  collapsible?: boolean;
  addable?: boolean;
  tree?: boolean;
  items: NavItem[];
};

const sections: Section[] = [
  {
    id: "top",
    items: [
      { label: "New Issue", href: "#new-issue", icon: SquarePen },
      { label: "Atlas", href: "#atlas", icon: Sparkles },
      { label: "Dashboard", href: "#dashboard", icon: LayoutGrid },
      { label: "Inbox", href: "#inbox", icon: Inbox, badge: "2" },
    ],
  },
  {
    id: "strategy",
    label: "Strategy",
    items: [
      { label: "Goals", href: "#goals", icon: Target },
      { label: "OKRs", href: "#okrs", icon: Workflow },
    ],
  },
  {
    id: "work",
    label: "Work",
    items: [
      { label: "Signals", href: "#signals", icon: Radio },
      { label: "Backlogs", href: "#backlogs", icon: Layers },
      { label: "Routines", href: "#routines", icon: Repeat },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    collapsible: true,
    addable: true,
    items: [
      {
        label: "Onboarding flow v2",
        href: "#proj-onboarding",
        status: "in_progress",
      },
      {
        label: "Pricing & billing rework",
        href: "#proj-pricing",
        status: "pending",
      },
      {
        label: "Mobile app launch",
        href: "#proj-mobile",
        status: "todo",
      },
      {
        label: "Customer health score",
        href: "#proj-health",
        status: "done",
      },
      {
        label: "AI agent marketplace",
        href: "#proj-marketplace",
        status: "in_progress",
      },
    ],
  },
  {
    id: "workforces",
    label: "Workforces",
    collapsible: true,
    addable: true,
    tree: true,
    items: [
      {
        label: "Jazz Hwang",
        href: "#m-jazz",
        avatar: "Jazz Hwang",
        kebab: true,
        children: [
          {
            label: "CEO",
            href: "#ceo",
            icon: Bot,
            kebab: true,
            agentStatus: AGENT_STATUSES.CEO,
          },
        ],
      },
      {
        label: "Daniel Kim",
        href: "#m-daniel",
        avatar: "Daniel Kim",
        kebab: true,
        children: [
          {
            label: "CTO",
            href: "#cto",
            icon: BrainCircuit,
            kebab: true,
            agentStatus: AGENT_STATUSES.CTO,
          },
          {
            label: "Engineer",
            href: "#engineer",
            icon: Wrench,
            kebab: true,
            agentStatus: AGENT_STATUSES.Engineer,
          },
        ],
      },
      {
        label: "Minji Park",
        href: "#m-minji",
        avatar: "Minji Park",
        kebab: true,
        children: [
          {
            label: "UXDesigner",
            href: "#ux",
            icon: Gem,
            kebab: true,
            agentStatus: AGENT_STATUSES.UXDesigner,
          },
        ],
      },
      {
        label: "Sora Lee",
        href: "#m-sora",
        avatar: "Sora Lee",
        kebab: true,
        children: [
          {
            label: "Marketer",
            href: "#marketer",
            icon: Megaphone,
            kebab: true,
            agentStatus: AGENT_STATUSES.Marketer,
          },
        ],
      },
      {
        label: "Hyunwoo Choi",
        href: "#m-hyunwoo",
        avatar: "Hyunwoo Choi",
        kebab: true,
        children: [],
      },
    ],
  },
  {
    id: "ssot",
    label: "Product",
    items: [
      { label: "Screens", href: "#screens", icon: Grid2x2 },
      { label: "Flow", href: "#flow", icon: Workflow },
      { label: "Design System", href: "#design-system", icon: Aperture },
      { label: "Policies", href: "#policies", icon: ShieldCheck },
      { label: "Data", href: "#data", icon: LineChart },
      { label: "Experiments", href: "#experiments", icon: FlaskConical },
    ],
  },
  {
    id: "company",
    label: "Company",
    items: [
      { label: "Org", href: "#org", icon: Network },
      { label: "Skills", href: "#skills", icon: Boxes },
      { label: "Costs", href: "#costs", icon: DollarSign },
      { label: "Activity", href: "#activity", icon: History },
      { label: "Settings", href: "#settings", icon: SettingsIcon },
    ],
  },
];

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
  activeHref: string;
  workspaceName: string;
  sampleData: boolean;
  onNavigate: (href: string) => void;
};

export function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
  activeHref,
  workspaceName,
  sampleData,
  onNavigate,
}: Props) {
  const widthClass = collapsed ? "lg:w-[76px]" : "lg:w-[260px]";

  return (
    <>
      <div
        aria-hidden={!mobileOpen}
        onClick={onCloseMobile}
        className={cn(
          "fixed inset-0 z-30 bg-charcoal/30 backdrop-blur-[1px] transition-opacity duration-200 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-[260px] flex-col border-r border-cream-light bg-cream text-charcoal transition-[width,transform] duration-300 ease-gentle",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:static lg:translate-x-0",
          widthClass
        )}
      >
        <SidebarHeader
          collapsed={collapsed}
          onToggleCollapsed={onToggleCollapsed}
          workspaceName={workspaceName}
        />

        <nav className="flex-1 overflow-y-auto px-2 pb-3">
          {sections
            .filter((section) => !(section.id === "projects" && !sampleData))
            .map((section, i) => (
              <SidebarSection
                key={section.id}
                section={section}
                collapsed={collapsed}
                activeHref={activeHref}
                onNavigate={onNavigate}
                isFirst={i === 0}
              />
            ))}
        </nav>

        <SidebarFooter collapsed={collapsed} />
      </aside>
    </>
  );
}

function SidebarHeader({
  collapsed,
  onToggleCollapsed,
  workspaceName,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  workspaceName: string;
}) {
  const initial = workspaceName.trim().charAt(0).toUpperCase() || "S";
  return (
    <div
      className={cn(
        "relative flex h-16 items-center gap-1.5 border-b border-cream-light px-3",
        collapsed && "lg:justify-center lg:px-2"
      )}
    >
      <button
        type="button"
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left transition hover:bg-[rgba(28,28,28,0.04)]",
          collapsed && "lg:flex-none lg:px-0"
        )}
        title={`Switch workspace · ${workspaceName}`}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-md bg-charcoal text-[12px] font-[600] text-charcoal-offwhite shadow-inset-dark">
          {initial}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[14.5px] font-[480] text-charcoal",
            collapsed && "lg:hidden"
          )}
        >
          {workspaceName}
        </span>
        <ChevronsUpDown
          className={cn(
            "h-3.5 w-3.5 text-charcoal-muted",
            collapsed && "lg:hidden"
          )}
          strokeWidth={1.6}
        />
      </button>

      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label="Collapse sidebar"
        title="Collapse sidebar"
        className={cn(
          "hidden h-7 w-7 items-center justify-center rounded-md text-charcoal/70 transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal lg:inline-flex",
          collapsed && "lg:hidden"
        )}
      >
        <PanelLeftClose className="h-4 w-4" strokeWidth={1.6} />
      </button>

      {collapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="absolute right-0 top-1/2 hidden h-7 w-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-pill border border-cream-light bg-cream text-charcoal/70 shadow-focus transition hover:text-charcoal lg:inline-flex"
        >
          <PanelLeftOpen className="h-3.5 w-3.5" strokeWidth={1.6} />
        </button>
      )}
    </div>
  );
}

function SidebarSection({
  section,
  collapsed,
  activeHref,
  onNavigate,
  isFirst,
}: {
  section: Section;
  collapsed: boolean;
  activeHref: string;
  onNavigate: (href: string) => void;
  isFirst: boolean;
}) {
  const [open, setOpen] = useState(true);

  const showLabel = !!section.label;
  const renderItems = !section.collapsible || open;

  return (
    <div className={cn(isFirst ? "pt-3" : "pt-5")}>
      {showLabel && !collapsed && (
        <div className="flex items-center gap-1 px-2 pb-1.5 pr-1.5">
          {section.collapsible ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded text-[11px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted transition hover:text-charcoal"
            >
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  open ? "rotate-0" : "-rotate-90"
                )}
                strokeWidth={2}
              />
              {section.label}
            </button>
          ) : (
            <p className="text-[11px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
              {section.label}
            </p>
          )}
          {section.addable && (
            <button
              type="button"
              aria-label={`Add ${section.label}`}
              className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded text-charcoal-muted transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          )}
        </div>
      )}

      {showLabel && collapsed && (
        <div className="mx-2 mb-1 h-px bg-cream-light lg:block" />
      )}

      {renderItems && (
        <ul className="flex flex-col gap-0.5">
          {section.items.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              activeHref={activeHref}
              onNavigate={onNavigate}
              tree={section.tree}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SidebarItem({
  item,
  collapsed,
  activeHref,
  onNavigate,
  tree,
}: {
  item: NavItem;
  collapsed: boolean;
  activeHref: string;
  onNavigate: (href: string) => void;
  tree?: boolean;
}) {
  const active = activeHref === item.href;
  const Icon = item.icon;
  const status = item.status ? STATUS_CONFIG[item.status] : null;
  const StatusIcon = status?.icon;
  const hasDescription = !!item.description && !collapsed;
  const childItems = tree ? item.children ?? [] : [];
  const hasChildren = childItems.length > 0;
  const [expanded, setExpanded] = useState(true);
  return (
    <li>
      <a
        href={item.href}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(item.href);
        }}
        title={
          item.agentStatus
            ? `${item.label} · ${AGENT_STATUS_CONFIG[item.agentStatus].label}`
            : collapsed
            ? status
              ? `${item.label} · ${status.label}`
              : item.label
            : status?.label
        }
        className={cn(
          "group relative flex rounded-md transition text-[14px]",
          hasDescription
            ? "items-start gap-2.5 py-2"
            : "items-center gap-2.5 py-1.5",
          tree && !collapsed ? "pl-1.5 pr-2" : "px-2",
          active
            ? "bg-[rgba(28,28,28,0.06)] text-charcoal"
            : "text-charcoal/80 hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal",
          collapsed && "lg:justify-center lg:px-0"
        )}
      >
        {tree && !collapsed &&
          (hasChildren ? (
            <button
              type="button"
              aria-label={expanded ? "Collapse" : "Expand"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className={cn(
                "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-charcoal-muted transition hover:bg-[rgba(28,28,28,0.08)] hover:text-charcoal",
                hasDescription && "mt-1"
              )}
            >
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  !expanded && "-rotate-90"
                )}
                strokeWidth={2}
              />
            </button>
          ) : (
            <span
              className={cn(
                "inline-block h-4 w-4 shrink-0",
                hasDescription && "mt-1"
              )}
            />
          ))}
        {StatusIcon && status ? (
          <StatusIcon
            className="h-[16px] w-[16px] shrink-0"
            style={{ color: status.color }}
            strokeWidth={1.8}
          />
        ) : item.href === "#atlas" ? (
          <AtlasAvatar size="xs" />
        ) : item.avatar ? (
          <PersonAvatar seed={item.avatar} size="xs" />
        ) : Icon ? (
          item.agentStatus ? (
            <span
              className={cn(
                "relative shrink-0",
                hasDescription ? "mt-0.5 h-[20px] w-[20px]" : "h-[18px] w-[18px]"
              )}
            >
              <Icon
                className={cn(
                  hasDescription ? "h-[20px] w-[20px]" : "h-[18px] w-[18px]",
                  active ? "text-charcoal" : "text-charcoal/70"
                )}
                strokeWidth={1.6}
              />
              <AgentPresenceDot status={item.agentStatus} />
            </span>
          ) : (
            <Icon
              className={cn(
                "shrink-0",
                hasDescription
                  ? "mt-0.5 h-[20px] w-[20px]"
                  : "h-[18px] w-[18px]",
                active ? "text-charcoal" : "text-charcoal/70"
              )}
              strokeWidth={1.6}
            />
          )
        ) : item.dotColor ? (
          <span
            className="ml-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.dotColor }}
          />
        ) : (
          <span className="h-[18px] w-[18px] shrink-0" />
        )}
        <span
          className={cn(
            "min-w-0 flex-1",
            collapsed && "lg:hidden",
            hasDescription && "flex flex-col gap-0.5"
          )}
        >
          <span className="truncate">{item.label}</span>
          {hasDescription && (
            <span className="truncate text-[12px] text-charcoal-muted">
              {item.description}
            </span>
          )}
        </span>
        {item.badge && !collapsed && (
          <span className="inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-pill border border-cream-light bg-cream px-1.5 text-[11px] font-[480] text-charcoal-muted">
            {item.badge}
          </span>
        )}
        {item.kebab && !collapsed && (
          <button
            type="button"
            aria-label="More"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="inline-flex h-5 w-5 items-center justify-center rounded text-charcoal-muted opacity-0 transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal group-hover:opacity-100"
          >
            <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.6} />
          </button>
        )}
      </a>
      {hasChildren && expanded && !collapsed && (
        <ul className="ml-[18px] mt-0.5 flex flex-col gap-0.5 border-l border-cream-light pl-2">
          {childItems.map((child) => (
            <SidebarItem
              key={child.href}
              item={child}
              collapsed={collapsed}
              activeHref={activeHref}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function AgentPresenceDot({ status }: { status: AgentStatus }) {
  const cfg = AGENT_STATUS_CONFIG[status];
  return (
    <span
      aria-label={cfg.label}
      className="absolute -bottom-0.5 -right-0.5 grid h-[10px] w-[10px] place-items-center rounded-full bg-cream"
    >
      {cfg.pulse ? (
        <span className="relative grid h-1.5 w-1.5 place-items-center">
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-60"
            style={{ backgroundColor: cfg.color }}
          />
          <span
            className="relative h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: cfg.color }}
          />
        </span>
      ) : (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: cfg.color }}
        />
      )}
    </span>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 border-t border-cream-light px-3 py-3",
        collapsed && "lg:justify-center lg:px-2"
      )}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-pill bg-charcoal text-[12px] font-[480] text-charcoal-offwhite shadow-inset-dark">
        JH
      </span>
      <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
        <p className="truncate text-[13.5px] text-charcoal">Jazz Hwang</p>
        <p className="truncate text-[12px] text-charcoal-muted">
          hjj4756@gmail.com
        </p>
      </div>
    </div>
  );
}
