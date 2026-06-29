"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: "12px",
  fontSize: "13px",
  color: "var(--foreground)",
};

interface ParticipationTrendChartProps {
  data: { label: string; count: number }[];
}

export function ParticipationTrendChart({ data }: ParticipationTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="participationGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="var(--muted)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="var(--muted)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "var(--muted)" }}
          formatter={(value) => [`${value} connexion${Number(value) > 1 ? "s" : ""}`, "Étudiants"]}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#participationGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface ExamsByMonthChartProps {
  data: { label: string; count: number }[];
}

export function ExamsByMonthChart({ data }: ExamsByMonthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="var(--muted)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [`${value}`, "Examens créés"]}
        />
        <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ExamStatusChartProps {
  data: { label: string; count: number; fill: string }[];
}

export function ExamStatusDonutChart({ data }: ExamStatusChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted">
        Aucun examen pour l&apos;instant
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data.filter((d) => d.count > 0)}
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={88}
            paddingAngle={3}
            dataKey="count"
            nameKey="label"
          >
            {data
              .filter((d) => d.count > 0)
              .map((entry) => (
                <Cell key={entry.label} fill={entry.fill} stroke="transparent" />
              ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{total}</span>
        <span className="text-xs text-muted">examens</span>
      </div>
    </div>
  );
}

interface CompletionGaugeProps {
  rate: number;
}

export function CompletionGauge({ rate }: CompletionGaugeProps) {
  const data = [
    { name: "Complétées", value: rate },
    { name: "Restantes", value: 100 - rate },
  ];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="85%"
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={95}
            dataKey="value"
            stroke="transparent"
          >
            <Cell fill="#3b82f6" />
            <Cell fill="var(--card-border)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center">
        <span className="text-3xl font-bold">{rate}%</span>
        <p className="text-xs text-muted">taux de complétion</p>
      </div>
    </div>
  );
}

export function ChartLegend({
  items,
}: {
  items: { label: string; count: number; fill: string }[];
}) {
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2 text-muted">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            {item.label}
          </span>
          <span className="font-medium">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}

export function DashboardChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="mb-5">
        <h3 className="font-semibold">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {children}
    </Card>
  );
}
