import {
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CheckCircle2,
  Circle,
} from "lucide-react";

const stats = [
  { label: "MRR", value: "$48.2K", change: "+12.4%", trend: "up" as const },
  { label: "Active users", value: "12,840", change: "+5.1%", trend: "up" as const },
  { label: "Churn", value: "1.8%", change: "-0.3%", trend: "down" as const },
  { label: "NPS", value: "62", change: "+4", trend: "up" as const },
];

const activities = [
  {
    title: "Acme Corp upgraded to Pro",
    meta: "2 minutes ago · billing",
    done: true,
  },
  {
    title: "New signup from Vercel team",
    meta: "12 minutes ago · onboarding",
    done: true,
  },
  {
    title: "Weekly report generated",
    meta: "1 hour ago · analytics",
    done: true,
  },
  {
    title: "Schedule customer interview",
    meta: "Due today · research",
    done: false,
  },
];

export function Dashboard() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <section className="mb-10">
        <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
          Welcome back
        </p>
        <h2 className="mt-2 text-section font-[600] text-charcoal md:text-section">
          Today's overview
        </h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-[1.5] text-charcoal-muted">
          A quiet morning on cream. Here's what's been happening across your
          workspace since you last checked in.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-charcoal-muted">{stat.label}</p>
              <button
                type="button"
                aria-label="More"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-charcoal/60 transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
              >
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.6} />
              </button>
            </div>
            <p className="mt-4 text-[32px] font-[600] tracking-[-0.6px] text-charcoal">
              {stat.value}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[13px]">
              {stat.trend === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-charcoal" strokeWidth={1.8} />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-charcoal" strokeWidth={1.8} />
              )}
              <span className="text-charcoal">{stat.change}</span>
              <span className="text-charcoal-muted">vs last week</span>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[13px] text-charcoal-muted">Revenue</p>
              <p className="mt-1 text-sub font-[600] tracking-[-0.9px] text-charcoal">
                $214,820
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="btn-pill opacity-50 hover:opacity-100">7d</button>
              <button className="btn-pill">30d</button>
              <button className="btn-pill opacity-50 hover:opacity-100">90d</button>
            </div>
          </div>
          <FakeChart />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-[480] text-charcoal">Activity</p>
            <button className="text-[13px] text-charcoal-muted underline-offset-4 hover:underline">
              View all
            </button>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {activities.map((a) => (
              <li key={a.title} className="flex items-start gap-3">
                {a.done ? (
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-charcoal"
                    strokeWidth={1.6}
                  />
                ) : (
                  <Circle
                    className="mt-0.5 h-4 w-4 shrink-0 text-charcoal-muted"
                    strokeWidth={1.6}
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-[14px] text-charcoal">{a.title}</p>
                  <p className="truncate text-[12.5px] text-charcoal-muted">
                    {a.meta}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-cream-light px-6 py-4">
            <p className="text-[15px] font-[480] text-charcoal">
              Recent customers
            </p>
            <button className="btn-ghost h-8 px-3 text-[13.5px]">Export</button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[12px] uppercase tracking-[0.06em] text-charcoal-muted">
                <th className="px-6 py-3 font-[480]">Customer</th>
                <th className="px-6 py-3 font-[480]">Plan</th>
                <th className="px-6 py-3 font-[480]">MRR</th>
                <th className="px-6 py-3 font-[480]">Status</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {[
                ["Acme Corp", "Pro", "$1,200", "Active"],
                ["Globex Ltd", "Team", "$540", "Trialing"],
                ["Soylent", "Pro", "$1,200", "Active"],
                ["Initech", "Starter", "$120", "Past due"],
              ].map(([name, plan, mrr, status]) => (
                <tr
                  key={name}
                  className="border-t border-cream-light hover:bg-[rgba(28,28,28,0.03)]"
                >
                  <td className="px-6 py-3 text-charcoal">{name}</td>
                  <td className="px-6 py-3 text-charcoal-muted">{plan}</td>
                  <td className="px-6 py-3 text-charcoal">{mrr}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2.5 py-1 text-[12px] text-charcoal">
                      <span className="h-1.5 w-1.5 rounded-full bg-charcoal" />
                      {status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FakeChart() {
  // Bar chart-ish, purely decorative — built from inline divs so no extra deps.
  const bars = [38, 52, 44, 61, 49, 73, 67, 58, 80, 72, 90, 84];
  return (
    <div className="mt-6 grid h-44 grid-cols-12 items-end gap-2">
      {bars.map((h, i) => (
        <div
          key={i}
          className="rounded-t-md bg-charcoal/85 transition-[height] duration-500"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
