import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDuration } from "../lib/time";
import type { Language } from "../lib/cookies";
import t from "../i18n";

const AXIS_TICK = { fill: "var(--text-subtle)", fontSize: 11 };

interface TooltipPoint {
  ms?: number;
  name?: string;
}

interface RechartsTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TooltipPoint; name?: string; value?: number }>;
  label?: string | number;
}

function ChartTooltip({ active, payload, label }: RechartsTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  const heading = point.name ?? label;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-[var(--shadow-pop)]"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {heading != null ? (
        <p className="font-semibold" style={{ color: "var(--text)" }}>
          {heading}
        </p>
      ) : null}
      <p className="mono-face mt-0.5" style={{ color: "var(--text-muted)" }}>
        {formatDuration(point.ms ?? 0)}
      </p>
    </div>
  );
}

interface TrendPointData {
  label: string;
  ms: number;
  hours: number;
}

export function TrendChart({
  data,
  language,
}: {
  data: TrendPointData[];
  language: Language;
}) {
  const suffix = t("hoursShort", language);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          interval="preserveStartEnd"
          minTickGap={16}
        />
        <YAxis
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={(value: number) => `${value}${suffix}`}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ stroke: "var(--border-strong)" }}
        />
        <Area
          type="monotone"
          dataKey="hours"
          stroke="var(--primary)"
          strokeWidth={2.4}
          fill="url(#trendFill)"
          dot={false}
          activeDot={{ r: 4, fill: "var(--primary)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface CategoryData {
  name: string;
  ms: number;
  hours: number;
  color?: string;
}

export function CategoryBarChart({
  data,
  language,
}: {
  data: CategoryData[];
  language: Language;
}) {
  if (data.length === 0) {
    return <ChartEmpty language={language} />;
  }
  const suffix = t("hoursShort", language);
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
      >
        <XAxis
          type="number"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tickFormatter={(value: number) => `${value}${suffix}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={110}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "var(--surface-2)" }}
        />
        <Bar dataKey="hours" radius={[0, 6, 6, 0]} maxBarSize={26}>
          {data.map((entry, index) => (
            <Cell
              key={entry.name + index}
              fill={entry.color ?? "var(--primary)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DistributionData {
  name: string;
  ms: number;
  color?: string;
}

export function DistributionPie({
  data,
  language,
}: {
  data: DistributionData[];
  language: Language;
}) {
  if (data.length === 0) {
    return <ChartEmpty language={language} />;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip content={<ChartTooltip />} />
        <Pie
          data={data}
          dataKey="ms"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={62}
          outerRadius={100}
          paddingAngle={2}
          stroke="var(--surface)"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.name + index}
              fill={entry.color ?? "var(--primary)"}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

function ChartEmpty({ language }: { language: Language }) {
  return (
    <div
      className="flex h-56 items-center justify-center text-sm"
      style={{ color: "var(--text-muted)" }}
    >
      {t("pie_noData", language)}
    </div>
  );
}
