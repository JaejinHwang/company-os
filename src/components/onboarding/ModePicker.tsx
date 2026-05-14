import { useEffect, useState } from "react";
import {
  Sparkles,
  FolderGit2,
  Dices,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/cn";
import type { OnboardingMode } from "./Onboarding";

type Props = {
  onSelect: (mode: OnboardingMode) => void;
};

const MODES: Array<{
  id: OnboardingMode;
  key: string;
  icon: LucideIcon;
  title: string;
  pitch: string;
  time: string;
  detail: string;
  accent: string;
}> = [
  {
    id: "scratch",
    key: "1",
    icon: Sparkles,
    title: "From scratch",
    pitch: "회사 이름·비전·첫 태스크·첫 인원을 차근차근 입력합니다.",
    time: "~2분",
    detail: "각 단계마다 빠르게 시작할 수 있는 자동 선택지가 제공돼요.",
    accent: "#1f8a4c",
  },
  {
    id: "existing",
    key: "2",
    icon: FolderGit2,
    title: "From existing code",
    pitch: "GitHub 레포 또는 로컬 디렉토리를 분석해 자동 구성합니다.",
    time: "~30초",
    detail: "README · manifest · 커밋 흐름에서 회사 정보를 유추해요.",
    accent: "#2563eb",
  },
  {
    id: "oracle",
    key: "3",
    icon: Dices,
    title: "Oracle",
    pitch: "운에 맡겨봐. 놀랄 결과물을 한 번에 만들어줍니다.",
    time: "~10초",
    detail: "회사 이름·비전·첫 태스크·첫 인원을 랜덤으로 결정해요.",
    accent: "#c89211",
  },
];

export function ModePicker({ onSelect }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full max-w-[1080px]">
      <header className="text-center">
        <p
          className={cn(
            "text-[13px] uppercase tracking-[0.08em] text-charcoal-muted transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          Welcome to Cream
        </p>
        <h1
          className={cn(
            "mt-3 text-[44px] font-[600] tracking-[-1.2px] leading-[1.05] text-charcoal transition-all duration-700 delay-75 sm:text-[56px]",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          )}
        >
          내 회사를 만들어 보세요
        </h1>
        <p
          className={cn(
            "mx-auto mt-4 max-w-xl text-[16px] leading-[1.55] text-charcoal-muted transition-all duration-700 delay-150",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          )}
        >
          백지 위에 차근차근 그릴 수도, 이미 있던 코드를 데려와도, 운에 한 번
          맡겨봐도 좋아요. 어느 쪽이든 첫 출근까진 오래 걸리지 않아요.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {MODES.map((m, i) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              style={{ transitionDelay: `${250 + i * 90}ms` }}
              className={cn(
                "group relative flex flex-col gap-4 overflow-hidden rounded-card border border-cream-light bg-cream p-6 text-left transition-all duration-700",
                "hover:border-[rgba(28,28,28,0.4)] hover:-translate-y-1 focus:outline-none focus-visible:shadow-focus",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                style={{ backgroundColor: `${m.accent}26` }}
              />

              <div className="flex items-start justify-between">
                <span
                  className="grid h-10 w-10 place-items-center rounded-pill border border-cream-light bg-cream transition-shadow duration-300 group-hover:shadow-inset-dark"
                  style={{ color: m.accent }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-cream-light bg-cream px-1.5 text-[11.5px] text-charcoal-muted">
                  {m.key}
                </kbd>
              </div>

              <div>
                <h3 className="text-[22px] font-[600] tracking-[-0.5px] text-charcoal">
                  {m.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-[1.5] text-charcoal-muted">
                  {m.pitch}
                </p>
              </div>

              <p className="text-[12.5px] leading-[1.55] text-charcoal-muted">
                {m.detail}
              </p>

              <div className="mt-auto flex items-center justify-between border-t border-cream-light pt-3">
                <span className="text-[12px] text-charcoal-muted">{m.time}</span>
                <span className="inline-flex items-center gap-1 text-[13px] text-charcoal transition-transform duration-300 group-hover:translate-x-1">
                  시작
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p
        className={cn(
          "mt-8 text-center text-[12.5px] text-charcoal-muted transition-all duration-700 delay-500",
          mounted ? "opacity-100" : "opacity-0"
        )}
      >
        키보드 단축키 ·{" "}
        <kbd className="rounded border border-cream-light bg-cream px-1.5 py-0.5 text-[11px]">
          1
        </kbd>{" "}
        From scratch ·{" "}
        <kbd className="rounded border border-cream-light bg-cream px-1.5 py-0.5 text-[11px]">
          2
        </kbd>{" "}
        From existing ·{" "}
        <kbd className="rounded border border-cream-light bg-cream px-1.5 py-0.5 text-[11px]">
          3
        </kbd>{" "}
        Oracle
      </p>
    </div>
  );
}
