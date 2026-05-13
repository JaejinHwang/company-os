import { Menu, Search, Bell, Plus } from "lucide-react";

type Props = {
  onOpenMobileSidebar: () => void;
  title: string;
};

export function Topbar({ onOpenMobileSidebar, title }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-cream-light bg-cream/85 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        aria-label="Open sidebar"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-charcoal/80 transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.6} />
      </button>

      <h1 className="text-[17px] font-[480] tracking-[-0.3px] text-charcoal">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted"
            strokeWidth={1.6}
          />
          <input
            type="text"
            placeholder="Search…"
            className="h-9 w-64 rounded-md border border-cream-light bg-cream pl-9 pr-3 text-[14px] text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-cream-light bg-cream px-1.5 py-0.5 text-[10.5px] text-charcoal-muted md:inline-flex">
            ⌘K
          </kbd>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-charcoal/80 transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.6} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-charcoal" />
        </button>

        <button type="button" className="btn-primary h-9 px-3 text-[13.5px]">
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          <span className="hidden sm:inline">New project</span>
        </button>
      </div>
    </header>
  );
}
