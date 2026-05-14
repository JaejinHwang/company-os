import { Database, Sparkles, Trash2 } from "lucide-react";
import { cn } from "../lib/cn";

type Props = {
  sampleData: boolean;
  workspaceName: string;
  onLoadSamples: () => void;
  onClearSamples: () => void;
};

export function Settings({
  sampleData,
  workspaceName,
  onLoadSamples,
  onClearSamples,
}: Props) {
  return (
    <div className="mx-auto max-w-[860px]">
      <header className="mb-8">
        <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
          Settings
        </p>
        <h2 className="mt-2 text-sub font-[600] tracking-[-0.9px] text-charcoal">
          워크스페이스 설정
        </h2>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.55] text-charcoal-muted">
          {workspaceName}의 데이터 · 멤버 · 통합을 관리합니다. 지금은 데이터 모드만
          조절할 수 있어요.
        </p>
      </header>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-cream-light px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[12.5px] text-charcoal-muted">
              <Database className="h-3.5 w-3.5" strokeWidth={1.6} />
              데이터 모드
            </div>
            <h3 className="mt-2 text-[20px] font-[600] tracking-[-0.4px] text-charcoal">
              샘플 워크스페이스
            </h3>
            <p className="mt-2 max-w-xl text-[14px] leading-[1.55] text-charcoal-muted">
              실제 회사 데이터 대신 데모용 시그널·백로그·OKR·루틴을 한 번에
              불러옵니다. 제품 둘러볼 때 켜고, 내 회사로 돌아갈 땐 끄세요.
            </p>
            <div className="mt-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-pill border px-2 py-0.5 text-[11.5px] font-[480]",
                  sampleData
                    ? "border-[rgba(31,138,76,0.25)] bg-[rgba(31,138,76,0.08)] text-[#1f8a4c]"
                    : "border-cream-light bg-cream text-charcoal-muted"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    sampleData ? "bg-[#1f8a4c]" : "bg-charcoal-muted"
                  )}
                />
                {sampleData ? "샘플 모드 켜짐" : "내 워크스페이스만 표시 중"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {sampleData ? (
              <button
                type="button"
                onClick={onClearSamples}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-cream-light bg-cream px-3 text-[13.5px] text-charcoal transition hover:bg-[rgba(28,28,28,0.04)]"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.6} />
                샘플 비우기
              </button>
            ) : (
              <button
                type="button"
                onClick={onLoadSamples}
                className="btn-primary h-9 px-3 text-[13.5px]"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
                샘플 불러오기
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-3">
          <SamplePreview
            label="Backlogs"
            value="6 issues"
            hint="CS · Bug · Internal · Competitor · Market"
          />
          <SamplePreview
            label="OKRs"
            value="4 objectives · 12 KRs"
            hint="Q2 2026 · On track 2 · At risk 2"
          />
          <SamplePreview
            label="Routines"
            value="12 routines"
            hint="Market · Ops · Finance · Compliance"
          />
        </div>
      </section>

      <section className="mt-4 card overflow-hidden opacity-60">
        <div className="px-6 py-5">
          <p className="text-[14px] font-[480] text-charcoal">
            워크스페이스 정보 · 멤버 · 결제
          </p>
          <p className="mt-1 text-[13px] text-charcoal-muted">
            추후 추가될 항목들이에요.
          </p>
        </div>
      </section>
    </div>
  );
}

function SamplePreview({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-md border border-cream-light bg-cream p-3.5">
      <p className="text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
        {label}
      </p>
      <p className="mt-1.5 text-[16px] font-[480] text-charcoal">{value}</p>
      <p className="mt-0.5 line-clamp-1 text-[12px] text-charcoal-muted">
        {hint}
      </p>
    </div>
  );
}
