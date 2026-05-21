import { Quote, X, Target } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

type Props = {
  sampleData: boolean;
  workspaceVision: string;
  onLoadSamples: () => void;
};

export function Goals({ sampleData, workspaceVision, onLoadSamples }: Props) {
  if (!sampleData) {
    return (
      <div className="mx-auto max-w-prose pb-16">
        <header className="mb-10">
          <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
            Goals
          </h2>
        </header>

        {workspaceVision ? (
          <Section label="Vision">
            <PullQuote>{workspaceVision}</PullQuote>
            <p className="mt-4 text-[14px] leading-[1.55] text-charcoal-muted">
              온보딩에서 적어둔 한 문장이에요. Mission · Manifesto · Anti-goals ·
              Horizons는 채워나가면 됩니다.
            </p>
          </Section>
        ) : (
          <EmptyState
            icon={Target}
            title="회사의 헌법을 적어보세요"
            description="비전 · 미션 · 매니페스토 · anti-goals · 장기 horizon. 결정이 망설여질 때 돌아올 단 한 장의 문서예요."
            onLoadSamples={onLoadSamples}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-prose pb-16">
      <header className="mb-10">
        <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
          Sprint Org
        </p>
        <h2 className="mt-2 text-sub font-[600] tracking-[-0.9px] text-charcoal">
          Goals
        </h2>
      </header>

      <Section label="Vision">
        <PullQuote>
          한 명의 창업자도 한 회사를 통째로 굴릴 수 있는 시대를 만든다.
        </PullQuote>
        <p className="mt-4 text-[16px] leading-[1.55] text-charcoal-muted">
          인간은 의사결정과 관계 빌딩에 집중하고, 나머지 운영은 에이전트가
          맡는 시대. 5년 뒤 모든 SaaS 회사는 이 형태로 다시 그려질 것이다. 우리는
          그 OS를 만든다.
        </p>
      </Section>

      <Section label="Mission">
        <p className="text-[18px] leading-[1.55] text-charcoal">
          시그널 수집부터 실행까지를 하나의 흐름으로 묶어,{" "}
          <span className="font-[480]">
            AI 에이전트가 회사 운영의 80% 이상을 책임지게 한다.
          </span>{" "}
          사람의 시간은 에이전트가 못 하는 일에만 쓴다 — 면대면 신뢰 구축,
          취향과 전략의 마지막 결정, 그리고 채용·문화·윤리.
        </p>
      </Section>

      <Section label="Spirits Manifesto">
        <p className="mb-6 text-[15px] leading-[1.55] text-charcoal-muted">
          매일 우리의 행동을 결정하는 7가지 원칙. 어떤 결정이 망설여질 때 이
          페이지로 돌아온다.
        </p>
        <ol className="space-y-5">
          <Spirit
            n={1}
            title="모든 일감은 한 KR을 향한다."
            body="목표에 닿지 않는 일감은 만들지 않는다. 이미 만들었다면 지운다. Backlog에 KR이 비어 있으면 그 일감은 아직 시작될 수 없다."
          />
          <Spirit
            n={2}
            title="에이전트가 디폴트, 사람은 예외다."
            body={`"이걸 정말 사람이 해야 하나?"를 매번 묻는다. 답이 "아니"라면 30분 안에 routine 또는 agent에 위임한다.`}
          />
          <Spirit
            n={3}
            title="반복되는 결정은 cron으로 굳힌다."
            body="매주 같은 결정을 두 번 내렸다면, 세 번째는 routine으로. 사람이 같은 판단을 반복하는 것은 시스템의 실패다."
          />
          <Spirit
            n={4}
            title="시그널은 버리지 않는다."
            body="외부 신호 누락은 곧 기회 손실. CS · Bug · Internal · Competitor · Market · Sales 6개 채널은 한 곳에 모이고, 24시간 안에 사람 손이 닿는다."
          />
          <Spirit
            n={5}
            title="속도 > 합의 > 완벽함."
            body="24시간 안에 결정, 48시간 안에 실행. 틀리면 빨리 고친다. 회의 한 번보다 작은 실패 한 번을 더 신뢰한다."
          />
          <Spirit
            n={6}
            title="에이전트도 컨텍스트를 갖는다."
            body="Screens · Flow · Design System · Policies · Data는 모든 에이전트가 참조하는 단 하나의 진실. SSOT가 흔들리면 에이전트의 모든 결정도 흔들린다."
          />
          <Spirit
            n={7}
            title="사람의 1시간을 아끼는 자동화에 먼저 투자한다."
            body="기능보다 도구, 도구보다 자동화. 한 시간을 아끼면 다음 한 시간은 더 큰 결정에 쓸 수 있다."
          />
        </ol>
      </Section>

      <Section label="Anti-goals (this quarter)">
        <p className="mb-4 text-[15px] leading-[1.55] text-charcoal-muted">
          매 분기 명시적으로 거절하는 것들. 이 리스트에 있는 일에는 시간을 쓰지
          않는다.
        </p>
        <ul className="space-y-2.5">
          <AntiGoal
            title="직접 영업 채널 무리한 확대"
            body="면대면 영업은 핵심 enterprise 딜만. 나머지는 self-serve 흐름으로."
          />
          <AntiGoal
            title="기능 확장"
            body="Marketplace · Mobile launch에만 집중. 다른 기능 요청은 다음 분기로."
          />
          <AntiGoal
            title="5명 이상의 채용"
            body="채용 전에 항상 에이전트 대체 가능성을 먼저 점검한다."
          />
          <AntiGoal
            title="투자 라운드 추가"
            body="지금 runway로 Q4까지 충분. 라운드 미팅에 시간 쓰지 않는다."
          />
        </ul>
      </Section>

      <Section label="2030 horizon">
        <PullQuote>
          단 한 명의 인간 + 100개의 에이전트가 매출 $100M, 100개국 진출.
        </PullQuote>
        <p className="mt-4 text-[16px] leading-[1.55] text-charcoal-muted">
          이 그림이 가능해 보이지 않으면, 우리가 만드는 OS의 어떤 부분이 부족한
          것이다. 분기마다 이 horizon을 거꾸로 분해해 다음 분기 OKR을 짠다.
        </p>
      </Section>

      <footer className="mt-12 border-t border-cream-light pt-6">
        <p className="text-[12.5px] text-charcoal-muted">
          이 문서는 분기마다 1회 다시 읽고, 1년에 1회 다시 쓴다. 마지막
          업데이트: 2026-04-01 · 다음 review: 2026-07-01
        </p>
      </footer>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 first:mt-0">
      <p className="mb-4 text-[11.5px] font-[480] uppercase tracking-[0.12em] text-charcoal-muted">
        {label}
      </p>
      {children}
    </section>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Quote
        className="mt-1 h-5 w-5 shrink-0 text-charcoal-muted"
        strokeWidth={1.6}
      />
      <p className="text-[28px] font-[480] leading-[1.25] tracking-[-0.5px] text-charcoal">
        {children}
      </p>
    </div>
  );
}

function Spirit({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <li className="grid grid-cols-[36px_1fr] items-start gap-4">
      <span className="mt-1 grid h-7 w-7 place-items-center rounded-pill bg-charcoal text-[12px] font-[480] text-charcoal-offwhite shadow-inset-dark">
        {n}
      </span>
      <div>
        <p className="text-[17px] font-[480] leading-[1.35] tracking-[-0.2px] text-charcoal">
          {title}
        </p>
        <p className="mt-1 text-[14.5px] leading-[1.55] text-charcoal-muted">
          {body}
        </p>
      </div>
    </li>
  );
}

function AntiGoal({ title, body }: { title: string; body: string }) {
  return (
    <li className="grid grid-cols-[20px_1fr] items-start gap-3">
      <X
        className="mt-1 h-3.5 w-3.5 shrink-0 text-danger"
        strokeWidth={2}
      />
      <div>
        <p className="text-[14.5px] font-[480] text-charcoal">{title}</p>
        <p className="mt-0.5 text-[13.5px] leading-[1.55] text-charcoal-muted">
          {body}
        </p>
      </div>
    </li>
  );
}

