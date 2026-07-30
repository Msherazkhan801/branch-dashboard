/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Period, HeadOfficeExpenseEntry } from "@/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface HeadOfficeExpenseGraphProps {
  period: Period;
  entries: HeadOfficeExpenseEntry[];
}

function getWeekNumber(dateStr: string): string {
  const date = new Date(dateStr);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneWeek = 604800000;
  const weekNum = Math.ceil((diff / oneWeek + startOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function groupByPeriod(entries: HeadOfficeExpenseEntry[], period: Period): { label: string; amount: number }[] {
  const groups = new Map<string, number>();

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

    groups.set(label, (groups.get(label) || 0) + entry.amount);
  }

  // Sort by label
  const sorted = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  return sorted.map(([label, amount]) => ({ label, amount }));
}

export default function HeadOfficeExpenseGraph({ period, entries }: HeadOfficeExpenseGraphProps) {
  const trendData = useMemo(() => groupByPeriod(entries, period), [entries, period]);

  if (trendData.length === 0) {
    return null;
  }

  const periodLabel =
    period === "daily" ? "Day" : period === "weekly" ? "Week" : period === "monthly" ? "Month" : "Year";

  const chartData: any = {
    labels: trendData.map((d) => d.label),
    datasets: [
      {
        label: "Head Office Expense",
        data: trendData.map((d) => d.amount),
        backgroundColor: "#E15554",
        borderRadius: 4,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            return `$${ctx.parsed.y.toLocaleString()}`;
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
      x: {
        ticks: {
          font: { size: 9 },
          maxRotation: 45,
        },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">Head Office Expense Trend ({periodLabel})</h2>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Grouped by {periodLabel}
        </span>
      </div>
      <div className="h-56">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
