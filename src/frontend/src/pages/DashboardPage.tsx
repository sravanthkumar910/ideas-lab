import { Skeleton } from "@/components/ui/skeleton";
import { Activity, RefreshCw, Rocket, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Deployment, Idea, IncubatorProject, Task } from "../types";

// ── Chart colors matching OKLCH design tokens ─────────────────────────────────
const COLOR_INDIGO = "#818cf8";
const COLOR_PINK = "#f472b6";
const COLOR_GREEN = "#34d399";
const COLOR_AMBER = "#fbbf24";
const COLOR_INDIGO_DARK = "#6366f1";

const GLOW_INDIGO = "rgba(99,102,241,0.22)";
const GLOW_GREEN = "rgba(16,185,129,0.22)";
const GLOW_AMBER = "rgba(245,158,11,0.22)";

const ACCENT_INDIGO = "rgba(99,102,241,0.12)";
const ACCENT_GREEN = "rgba(16,185,129,0.10)";
const ACCENT_AMBER = "rgba(245,158,11,0.10)";

const BAR_COLORS = [COLOR_INDIGO, COLOR_PINK, COLOR_GREEN, COLOR_AMBER];

// ── Stat card config ─────────────────────────────────────────────────────────
const STAT_CONFIG = [
  {
    label: "LIVE PROJECTS",
    sub: "From Deployment Hub",
    color: COLOR_INDIGO,
    glow: GLOW_INDIGO,
    accent: ACCENT_INDIGO,
  },
  {
    label: "COMPLETED",
    sub: "From Incubator",
    color: COLOR_GREEN,
    glow: GLOW_GREEN,
    accent: ACCENT_GREEN,
  },
  {
    label: "PENDING IDEAS",
    sub: "From Ideas Lab",
    color: COLOR_AMBER,
    glow: GLOW_AMBER,
    accent: ACCENT_AMBER,
  },
] as const;

// ── Custom recharts tooltip ───────────────────────────────────────────────────
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; fill: string }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: "rgba(15,23,42,0.96)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 14,
          padding: "10px 18px",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        <p
          style={{
            color: "rgba(165,180,252,0.7)",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 4,
          }}
        >
          {label}
        </p>
        <p
          style={{
            color: payload[0].fill,
            fontSize: 22,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// ── Activity item type ────────────────────────────────────────────────────────
type ActivityKind = "idea" | "project" | "deployment";
interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  meta: string;
  icon: string;
  color: string;
}

function buildActivityFeed(
  ideas: Idea[],
  projects: IncubatorProject[],
  deployments: Deployment[],
): ActivityItem[] {
  const items: ActivityItem[] = [
    ...ideas.map((i) => ({
      id: `idea-${String(i.id)}`,
      kind: "idea" as ActivityKind,
      title: i.name,
      meta: `Idea • ${i.status}`,
      icon: "💡",
      color: COLOR_AMBER,
    })),
    ...projects.map((p) => ({
      id: `project-${String(p.id)}`,
      kind: "project" as ActivityKind,
      title: p.name,
      meta: "Incubator Project",
      icon: "🧪",
      color: COLOR_GREEN,
    })),
    ...deployments.map((d) => ({
      id: `deploy-${String(d.id)}`,
      kind: "deployment" as ActivityKind,
      title: d.name,
      meta: `Deployed • ${d.engineType}`,
      icon: "🚀",
      color: COLOR_INDIGO,
    })),
  ];
  return items.slice(0, 5);
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface DashboardPageProps {
  liveCount: number;
  completedCount: number;
  pendingCount: number;
  ideas?: Idea[];
  incubatorProjects?: IncubatorProject[];
  deployments?: Deployment[];
  tasks?: Task[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function DashboardPage({
  liveCount,
  completedCount,
  pendingCount,
  ideas = [],
  incubatorProjects = [],
  deployments = [],
  tasks = [],
  isLoading = false,
  onRefresh,
}: DashboardPageProps) {
  const [refreshing, setRefreshing] = useState(false);

  // Refresh on mount — intentionally run only once
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    if (onRefreshRef.current) {
      void onRefreshRef.current();
    }
  }, []);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const statValues = [liveCount, completedCount, pendingCount];

  const chartData = [
    { name: "Ideas", value: ideas.length },
    { name: "Incubator", value: incubatorProjects.length },
    { name: "Tasks", value: tasks.length },
    { name: "Deployed", value: deployments.length },
  ];

  const total = liveCount + completedCount + pendingCount;
  const hasAnyData = total > 0 || ideas.length > 0 || tasks.length > 0;

  const activityItems = buildActivityFeed(
    ideas,
    incubatorProjects,
    deployments,
  );

  const chartLegend = [
    { label: "Ideas", color: BAR_COLORS[0] },
    { label: "Incubator", color: BAR_COLORS[1] },
    { label: "Tasks", color: BAR_COLORS[2] },
    { label: "Deployed", color: BAR_COLORS[3] },
  ];

  return (
    <div className="space-y-8" data-ocid="dashboard.section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-foreground tracking-tight">
            Overview
          </h2>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-semibold">
            Live project counters by dashboard
          </p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing || isLoading}
            data-ocid="dashboard.refresh_button"
            className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-smooth disabled:opacity-40 glass-hover"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        )}
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STAT_CONFIG.map((card, i) =>
          isLoading ? (
            <div
              key={card.label}
              className="glass p-6 rounded-3xl"
              data-ocid={`dashboard.stat.item.${i + 1}`}
            >
              <Skeleton
                className="h-3 w-28 mb-5"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <Skeleton
                className="h-12 w-16 mb-3"
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
              {/* Accent top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
                style={{
                  background: `linear-gradient(90deg, ${card.color}, transparent)`,
                }}
              />
              {/* Ambient blob */}
              <div
                className="absolute -top-8 -right-8 w-36 h-36 rounded-full blur-2xl pointer-events-none"
                style={{ background: card.accent }}
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
                  className="text-5xl font-display font-extrabold tracking-tight mb-2 tabular-nums"
                  style={{ color: card.color }}
                >
                  {statValues[i]}
                </h3>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                  {card.sub}
                </p>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Main content row: Chart + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart — takes 2/3 width */}
        <div
          className="lg:col-span-2 glass rounded-[2.5rem] animate-fade-in"
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
                  background: "rgba(99,102,241,0.13)",
                  border: "1px solid rgba(129,140,248,0.25)",
                  color: COLOR_INDIGO,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse inline-block"
                  style={{
                    background: COLOR_INDIGO,
                    boxShadow: `0 0 8px ${COLOR_INDIGO_DARK}`,
                  }}
                />
                Live Sync
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 px-8 py-3">
            {chartLegend.map((item) => (
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
              <div className="h-[260px] flex items-end gap-8 px-4">
                {[
                  ["ideas", 65],
                  ["incubator", 42],
                  ["tasks", 85],
                  ["deployed", 55],
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
          ) : !hasAnyData ? (
            <div
              className="flex flex-col items-center justify-center h-[260px] px-8 pb-8"
              data-ocid="dashboard.chart.empty_state"
            >
              <Zap className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">
                No data yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add ideas, projects, or tasks to see your pipeline
              </p>
            </div>
          ) : (
            <div
              className="px-4 pb-8"
              data-ocid="dashboard.chart.canvas_target"
            >
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 16, right: 20, bottom: 8, left: -10 }}
                    barCategoryGap="38%"
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
                    <Bar
                      dataKey="value"
                      radius={[10, 10, 0, 0]}
                      maxBarSize={72}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`bar-${entry.name}`}
                          fill={BAR_COLORS[index]}
                          style={{
                            filter: `drop-shadow(0 4px 14px ${BAR_COLORS[index]}50)`,
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

        {/* Activity Feed — takes 1/3 width */}
        <div
          className="glass rounded-3xl animate-fade-in flex flex-col"
          data-ocid="dashboard.activity.card"
        >
          <div className="p-6 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: COLOR_INDIGO }} />
              <h4 className="text-base font-display font-bold text-foreground">
                Recent Activity
              </h4>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest across all modules
            </p>
          </div>

          <div className="flex-1 p-4 space-y-2 overflow-hidden">
            {isLoading ? (
              (["a1", "a2", "a3", "a4", "a5"] as const).map((key, i) => (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  data-ocid={`dashboard.activity.item.${i + 1}`}
                >
                  <Skeleton
                    className="w-9 h-9 rounded-xl flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <Skeleton
                      className="h-3 w-3/4 mb-2"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    />
                    <Skeleton
                      className="h-2 w-1/2"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    />
                  </div>
                </div>
              ))
            ) : activityItems.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full py-10 text-center"
                data-ocid="dashboard.activity.empty_state"
              >
                <Rocket className="w-8 h-8 text-muted-foreground/25 mb-2" />
                <p className="text-xs font-semibold text-muted-foreground/60">
                  No activity yet
                </p>
                <p className="text-[10px] text-muted-foreground/40 mt-1">
                  Start adding ideas or projects
                </p>
              </div>
            ) : (
              activityItems.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl glass-hover transition-smooth cursor-default"
                  data-ocid={`dashboard.activity.item.${i + 1}`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{
                      background: `${item.color}18`,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold truncate">
                      {item.meta}
                    </p>
                  </div>
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: item.color,
                      boxShadow: `0 0 6px ${item.color}`,
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Footer Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Projects",
            value: total,
            icon: "📊",
          },
          {
            label: "Active Rate",
            value:
              total > 0 ? `${Math.round((liveCount / total) * 100)}%` : "—",
            icon: "⚡",
          },
          {
            label: "Pipeline Health",
            value: pendingCount > 0 ? "Active" : total > 0 ? "Steady" : "Idle",
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
              <p className="text-lg font-bold text-foreground tabular-nums">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
