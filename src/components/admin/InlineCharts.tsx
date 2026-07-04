"use client";

interface ChartItem {
  label: string;
  value: number;
  color?: string;
}

interface ChartData {
  type: "bar" | "donut" | "progress";
  title: string;
  items: ChartItem[];
}

function BarChart({ title, items }: ChartData) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <p className="mb-3 text-xs font-semibold text-slate-700">{title}</p>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="min-w-0">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="truncate text-slate-600">{item.label}</span>
              <span className="ml-2 font-medium text-slate-800">{item.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max((item.value / max) * 100, 4)}%`,
                  backgroundColor: item.color ?? "#2563eb",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ title, items }: ChartData) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return null;

  let cumulative = 0;
  const segments = items.map((item) => {
    const pct = (item.value / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { ...item, pct, start };
  });

  const gradientStops = segments
    .map(
      (s) =>
        `${s.color ?? "#2563eb"} ${s.start}% ${s.start + s.pct}%`
    )
    .join(", ");

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <p className="mb-3 text-xs font-semibold text-slate-700">{title}</p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
        <div
          className="relative h-20 w-20 shrink-0 rounded-full sm:h-24 sm:w-24"
          style={{
            background: `conic-gradient(${gradientStops})`,
          }}
        >
          <div className="absolute inset-[30%] flex items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700">
            {total}
          </div>
        </div>
        <div className="w-full space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: item.color ?? "#2563eb" }}
              />
              <span className="truncate text-slate-600">{item.label}</span>
              <span className="ml-auto font-medium text-slate-800">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressChart({ title, items }: ChartData) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <p className="mb-3 text-xs font-semibold text-slate-700">{title}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="min-w-0">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="truncate text-slate-600">{item.label}</span>
              <span className="ml-2 font-medium text-slate-800">{item.value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max(item.value, 3)}%`,
                  backgroundColor: item.color ?? "#2563eb",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InlineCharts({ charts }: { charts: ChartData[] }) {
  if (!charts || charts.length === 0) return null;

  return (
    <div className="mt-3 grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2">
      {charts.map((chart, i) => {
        switch (chart.type) {
          case "bar":
            return <BarChart key={i} {...chart} />;
          case "donut":
            return <DonutChart key={i} {...chart} />;
          case "progress":
            return <ProgressChart key={i} {...chart} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
