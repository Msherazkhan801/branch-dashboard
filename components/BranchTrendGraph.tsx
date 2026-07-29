/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Branch, Period, IncomeEntry, ClassExpenseEntry, ExtraExpenseEntry, TrendDataPoint } from "@/types";
import { BRANCHES, BRANCH_COLORS } from "@/lib/constants";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface BranchTrendGraphProps {
  period: Period;
  incomeEntries: IncomeEntry[];
  classEntries: ClassExpenseEntry[];
  extraEntries: ExtraExpenseEntry[];
  branchFilter?: Branch; // If provided, show only this branch
}

function getWeekNumber(dateStr: string): string {
  const date = new Date(dateStr);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneWeek = 604800000;
  const weekNum = Math.ceil((diff / oneWeek + startOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function groupByPeriod(entries: { date: string; amount?: number; expense?: number; procedures?: number; customers?: number }[], period: Period): TrendDataPoint[] {
  const groups = new Map<string, { income: number; expense: number; procedures: number; customers: number }>();

  for (const entry of entries) {
    let label = "";
    switch (period) {
      case "daily":
        label = entry.date;
        break;
      case "weekly":
        label = getWeekNumber(entry.date);
        break;
      case "monthly":
        label = entry.date.substring(0, 7); // YYYY-MM
        break;
      case "yearly":
        label = entry.date.substring(0, 4); // YYYY
        break;
    }

    if (!groups.has(label)) {
      groups.set(label, { income: 0, expense: 0, procedures: 0, customers: 0 });
    }

    const current = groups.get(label)!;
    if (entry.amount !== undefined) {
      current.income += entry.amount;
    }
    if (entry.expense !== undefined) {
      current.expense += entry.expense;
    }
    if (entry.procedures !== undefined) {
      current.procedures += entry.procedures;
    }
    if (entry.customers !== undefined) {
      current.customers += entry.customers;
    }
  }

  // Sort by label
  const sorted = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  return sorted.map(([label, data]) => ({ label, ...data }));
}

export default function BranchTrendGraph({
  period,
  incomeEntries,
  classEntries,
  extraEntries,
  branchFilter,
}: BranchTrendGraphProps) {
  // Filter by branch if specified
  const filteredIncome = useMemo(
    () => (branchFilter ? incomeEntries.filter((e) => e.branch === branchFilter) : incomeEntries),
    [incomeEntries, branchFilter]
  );
  const filteredClass = useMemo(
    () => (branchFilter ? classEntries.filter((e) => e.branch === branchFilter) : classEntries),
    [classEntries, branchFilter]
  );
  const filteredExtra = useMemo(
    () => (branchFilter ? extraEntries.filter((e) => e.branch === branchFilter) : extraEntries),
    [extraEntries, branchFilter]
  );

  // Group income by period
  const incomeTrend = useMemo(
    () => groupByPeriod(filteredIncome.map((e) => ({ date: e.date, amount: e.amount })), period),
    [filteredIncome, period]
  );

  // Group class expenses by period
  const classTrend = useMemo(
    () =>
      groupByPeriod(
        filteredClass.map((e) => ({ date: e.date, expense: e.expense, procedures: e.procedures, customers: e.customers })),
        period
      ),
    [filteredClass, period]
  );

  // Group extra expenses by period
  const extraTrend = useMemo(
    () => groupByPeriod(filteredExtra.map((e) => ({ date: e.date, amount: e.amount })), period),
    [filteredExtra, period]
  );

  // Merge and aggregate all data by label
  const mergedData = useMemo(() => {
    const map = new Map<string, TrendDataPoint>();

    for (const point of incomeTrend) {
      if (!map.has(point.label)) {
        map.set(point.label, { label: point.label, income: 0, expense: 0, procedures: 0, customers: 0 });
      }
      map.get(point.label)!.income += point.income;
    }

    for (const point of classTrend) {
      if (!map.has(point.label)) {
        map.set(point.label, { label: point.label, income: 0, expense: 0, procedures: 0, customers: 0 });
      }
      const current = map.get(point.label)!;
      current.expense += point.expense;
      current.procedures += point.procedures;
      current.customers += point.customers;
    }

    for (const point of extraTrend) {
      if (!map.has(point.label)) {
        map.set(point.label, { label: point.label, income: 0, expense: 0, procedures: 0, customers: 0 });
      }
      map.get(point.label)!.expense += point.expense;
    }

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [incomeTrend, classTrend, extraTrend]);

  if (mergedData.length === 0) {
    return null;
  }

  const labels = mergedData.map((d) => d.label);
  const incomeData = mergedData.map((d) => d.income);
  const expenseData = mergedData.map((d) => d.expense);
  const profitData = mergedData.map((d) => d.income - d.expense);
  const proceduresData = mergedData.map((d) => d.procedures);

  // Determine colors based on branch filter
  const incomeColor = branchFilter ? BRANCH_COLORS[branchFilter] : "#16324F";
  const expenseColor = "#E15554";
  const profitColor = "#1FA2A6";

  const periodLabel =
    period === "daily" ? "Day" : period === "weekly" ? "Week" : period === "monthly" ? "Month" : "Year";

  // Build datasets separately to avoid complex union types
  const chartData: any = {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        borderColor: incomeColor,
        backgroundColor: incomeColor + "20",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: "Expenses",
        data: expenseData,
        borderColor: expenseColor,
        backgroundColor: expenseColor + "20",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: "Net Profit/Loss",
        data: profitData,
        borderColor: profitColor,
        backgroundColor: profitData.map((v: number) => (v >= 0 ? "#2E9E5B" : "#E15554")),
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      ...(branchFilter
        ? []
        : [
            {
              label: "Procedures",
              data: proceduresData,
              borderColor: "#E8A33D",
              backgroundColor: "#E8A33D20",
              fill: true,
              tension: 0.4,
              pointRadius: 2,
              pointHoverRadius: 5,
              yAxisID: "y1" as const,
            },
          ]),
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 16,
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.dataset.label || "";
            const val = ctx.parsed.y;
            if (label === "Procedures") return `${label}: ${val}`;
            return `${label}: $${val.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val: number) => "$" + val.toLocaleString(),
          font: { size: 10 },
        },
        grid: { color: "#f0f0f0" },
      },
      ...(branchFilter
        ? {}
        : {
            y1: {
              beginAtZero: true,
              position: "right" as const,
              grid: { display: false },
              ticks: {
                font: { size: 10 },
              },
            },
          }),
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">
          {branchFilter ? `${branchFilter} - ` : ""}Trend Graph ({periodLabel})
        </h2>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Grouped by {periodLabel}
        </span>
      </div>
      <div className="h-72">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

