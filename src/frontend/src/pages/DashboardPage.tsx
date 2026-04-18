import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardPageProps {
  liveCount: number;
  completedCount: number;
  pendingCount: number;
  isLoading?: boolean;
}

interface StatCard {
  label: string;
  sub: string;
  value: number;
  color: string;
  glow: string;
  accent: string;
}

const BAR_COLORS = ["#6366f1", "#10b981", "#f59e0b"];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "10px 16px",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        <p
          style={{
            color: "rgba(165,180,252,0.7)",
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 4,
          }}
        >
          {label}
        </p>
        <p style={{ color: "#fff", fontSize: "20px", fontWeight: 800 }}>
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function DashboardPage({
  liveCount,
  completedCount,
  pendingCount,
  isLoading = false,
}: DashboardPageProps) {
  const statCards: StatCard[] = [
    {
      label: "LIVE PROJECTS",
      sub: "From Deployment Hub",
      value: liveCount,
      color: "#818cf8",
      glow: "rgba(99,102,241,0.25)",
      accent: "rgba(99,102,241,0.15)",
    },
    {
      label: "COMPLETED",
      sub: "From Incubator",
      value: completedCount,
      color: "#34d399",
      glow: "rgba(16,185,129,0.25)",
      accent: "rgba(16,185,129,0.12)",
    },
    {
      label: "PENDING",
      sub: "From Ideas Lab",
      value: pendingCount,
      color: "#fbbf24",
      glow: "rgba(245,158,11,0.25)",
      accent: "rgba(245,158,11,0.12)",
    },
  ];

  const chartData = [
    { name: "Live (Deployed)", value: liveCount },
    { name: "Completed (Incubating)", value: completedCount },
    { name: "Pending (Ideas)", value: pendingCount },
  ];

  return (
    <div className="space-y-8" data-ocid="dashboard.section">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) =>
          isLoading ? (
            <div
              key={card.label}
              className="glass p-6 rounded-3xl"
              data-ocid={`dashboard.stat.item.${i + 1}`}
            >
              <Skeleton
                className="h-3 w-28 mb-4"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <Skeleton
                className="h-10 w-16 mb-2"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <Skeleton
                className="h-2 w-24"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
            </div>
          ) : (
            <div
              key={card.label}
              className="glass rounded-3xl animate-fade-in transition-smooth hover:-translate-y-1 relative overflow-hidden"
              style={{ boxShadow: `0 0 40px ${card.glow}` }}
              data-ocid={`dashboard.stat.item.${i + 1}`}
            >
              {/* Accent gradient top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
                style={{
                  background: `linear-gradient(90deg, ${card.color}, transparent)`,
                }}
              />
              {/* Background accent blob */}
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl"
                style={{ background: card.accent, pointerEvents: "none" }}
              />
              <div className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: card.color }}
                  >
                    {card.label}
                  </p>
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      background: card.color,
                      boxShadow: `0 0 8px ${card.color}`,
                    }}
                  />
                </div>
                <h3
                  className="text-5xl font-display font-extrabold tracking-tight mb-2"
                  style={{ color: card.color }}
                >
                  {card.value}
                </h3>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                  {card.sub}
                </p>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Chart Card */}
      <div
        className="glass rounded-[2.5rem] animate-fade-in"
        data-ocid="dashboard.chart.card"
      >
        <div className="p-8 pb-2">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xl font-display font-bold text-foreground">
                Innovation Lifecycle Tracker
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Visualizing your project pipeline at a glance
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest"
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#818cf8",
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse inline-block"
                style={{ background: "#818cf8", boxShadow: "0 0 8px #6366f1" }}
              />
              Live Sync Enabled
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 px-8 py-3">
          {[
            { label: "Live (Deployed)", color: "#6366f1" },
            { label: "Completed (Incubating)", color: "#10b981" },
            { label: "Pending (Ideas)", color: "#f59e0b" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: item.color }}
              />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="px-8 pb-8">
            <div className="h-[300px] flex items-end gap-8 px-4">
              {[
                ["live", 65],
                ["completed", 42],
                ["pending", 85],
              ].map(([key, h]) => (
                <div
                  key={key}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <Skeleton
                    className="w-full rounded-t-xl"
                    style={{
                      height: `${h}%`,
                      background: "rgba(255,255,255,0.06)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 pb-8" data-ocid="dashboard.chart.canvas_target">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 16, right: 20, bottom: 8, left: -10 }}
                  barCategoryGap="40%"
                >
                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "rgba(255,255,255,0.45)",
                      fontSize: 11,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 600,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: "rgba(255,255,255,0.25)",
                      fontSize: 11,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={80}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`bar-${entry.name}`}
                        fill={BAR_COLORS[index]}
                        style={{
                          filter: `drop-shadow(0 4px 12px ${BAR_COLORS[index]}40)`,
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Projects",
            value: liveCount + completedCount + pendingCount,
            icon: "📊",
          },
          {
            label: "Active Rate",
            value:
              liveCount + completedCount + pendingCount > 0
                ? `${Math.round((liveCount / (liveCount + completedCount + pendingCount)) * 100)}%`
                : "—",
            icon: "⚡",
          },
          {
            label: "Pipeline Health",
            value: pendingCount > 0 ? "Active" : "Idle",
            icon: "🔬",
          },
        ].map((item, i) => (
          <div
            key={item.label}
            className="glass rounded-2xl p-4 flex items-center gap-4 transition-smooth hover:scale-[1.02]"
            data-ocid={`dashboard.summary.item.${i + 1}`}
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                {item.label}
              </p>
              <p className="text-lg font-bold text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
