import type { ComponentType, CSSProperties, ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "../lib/cn";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

type Props = {
  icon: IconType;
  title: string;
  description: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  onLoadSamples?: () => void;
  loadSamplesLabel?: string;
  className?: string;
  children?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  onLoadSamples,
  loadSamplesLabel = "샘플 워크스페이스 불러오기",
  className,
  children,
}: Props) {
  return (
    <div
      className={cn(
        "card flex flex-col items-center justify-center px-6 py-16 text-center",
        className
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-pill border border-cream-light bg-cream text-charcoal-muted">
        <Icon className="h-5 w-5" strokeWidth={1.6} />
      </span>
      <h3 className="mt-5 text-[20px] font-[600] tracking-[-0.3px] text-charcoal">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-[14px] leading-[1.55] text-charcoal-muted">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex items-center gap-2">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="btn-primary h-9 px-3 text-[13.5px]"
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-cream-light bg-cream px-3 text-[13.5px] text-charcoal transition hover:bg-[rgba(28,28,28,0.04)]"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}

      {onLoadSamples && (
        <button
          type="button"
          onClick={onLoadSamples}
          className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] text-charcoal-muted underline-offset-4 transition hover:text-charcoal hover:underline"
        >
          <Sparkles className="h-3 w-3" strokeWidth={1.8} />
          {loadSamplesLabel}
        </button>
      )}

      {children}
    </div>
  );
}
