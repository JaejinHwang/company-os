import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const STORAGE_KEY = "cream.sidebar.collapsed";

type Props = {
  title: string;
  activeHref: string;
  workspaceName: string;
  sampleData: boolean;
  onNavigate: (href: string) => void;
  onOpenChoS: () => void;
  children: ReactNode;
};

export function AppShell({
  title,
  activeHref,
  workspaceName,
  sampleData,
  onNavigate,
  onOpenChoS,
  children,
}: Props) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setCollapsed((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        onOpenChoS();
      }
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChoS]);

  return (
    <div className="@container flex h-full w-full overflow-hidden bg-cream text-charcoal">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        activeHref={activeHref}
        workspaceName={workspaceName}
        sampleData={sampleData}
        onNavigate={(href) => {
          onNavigate(href);
          setMobileOpen(false);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          title={title}
        />
        <main className="@container min-h-0 flex-1 overflow-y-auto px-4 py-6 @3xl:px-8 @3xl:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
