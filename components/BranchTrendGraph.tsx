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
import { Branch, Period, ClassIncomeEntry } from "@/types";
import { BRANCHES, BRANCH_COLORS, CLASSES } from "@/lib/constants";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BranchTrendGraphProps {
  period: Period;
  incomeEntries: any[];
  classEntries: ClassIncomeEntry[];
  extraEntries: any[];
  branchFilter?: Branch;
}

// Distinct colors for procedure classes (used when viewing a single branch)
const CLASS_COLORS = [
  "#16324F",
  "#1FA2A6",
  "#E8A33D",
  "#E15554",
  "#2E9E5B",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#6366F1",
  "#14B8A6",
  "#F97316",
  "#84CC16",
  "#06B6D4",
];

function getWeekNumber(dateStr: string): string {
  const date = new Date(dateStr);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneWeek = 604800000;
  const weekNum = Math.ceil((diff / oneWeek + startOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function getPeriodLabel(date: string, period: Period): string {
  switch (period) {
    case "daily":
      return date;
    case "weekly":
      return getWeekNumber(date);
    case "monthly":
      return date.substring(0, 7);
    case "yearly":
      return date.substring(0, 4);
  }
}

export default function BranchTrendGraph({
  period,
  classEntries,
  branchFilter,
}: BranchTrendGraphProps) {
  const periodLabelText =
    period === "daily"
      ? "Day"
      : period === "weekly"
        ? "Week"
        : period === "monthly"
          ? "Month"
          : "Year";

  // Pre-compute class-wise breakdown per period per branch (for tooltips)
  const classBreakdown = useMemo(() => {
    const breakdown = new Map<string, Map<Branch, Map<string, number>>>();

    for (const entry of classEntries) {
      const label = getPeriodLabel(entry.date, period);
      if (!breakdown.has(label)) {
        breakdown.set(label, new Map());
      }
      const branchMap = breakdown.get(label)!;
      if (!branchMap.has(entry.branch)) {
        branchMap.set(entry.branch, new Map());
      }
      const classMap = branchMap.get(entry.branch)!;
      classMap.set(entry.procClass, (classMap.get(entry.procClass) || 0) + entry.procedures);
    }

    return breakdown;
  }, [classEntries, period]);

  // Build chart data
  const { labels, datasets } = useMemo(() => {
    if (branchFilter) {
      // ─── BRANCH-SPECIFIC VIEW: Show class-wise procedure bars ───
      const filtered = classEntries.filter((e) => e.branch === branchFilter);

      // Aggregate procedures by period AND class
      const periodClassMap = new Map<string, Map<string, number>>();

      for (const entry of filtered) {
        const label = getPeriodLabel(entry.date, period);
        if (!periodClassMap.has(label)) {
          periodClassMap.set(label, new Map());
        }
        const classMap = periodClassMap.get(label)!;
        classMap.set(
          entry.procClass,
          (classMap.get(entry.procClass) || 0) + entry.procedures
        );
      }

      const sortedLabels = Array.from(periodClassMap.keys()).sort((a, b) =>
        a.localeCompare(b)
      );

      // Collect all unique classes in the data, ordered by CLASSES list
      const activeClasses = new Set<string>();
      for (const classMap of periodClassMap.values()) {
        for (const cls of classMap.keys()) {
          activeClasses.add(cls);
        }
      }
      const sortedClasses = CLASSES.filter((c) => activeClasses.has(c));

      if (sortedLabels.length === 0) return { labels: [], datasets: [] };

      const ds = sortedClasses.map((cls, idx) => ({
        label: cls,
        data: sortedLabels.map((lbl) => periodClassMap.get(lbl)?.get(cls) || 0),
        backgroundColor: CLASS_COLORS[idx % CLASS_COLORS.length],
        borderRadius: 4,
        barPercentage: 0.85,
        categoryPercentage: 0.75,
      }));

      return { labels: sortedLabels, datasets: ds };
    } else {
      // ─── GLOBAL VIEW: Show branch-wise procedure bars ───
      // Aggregate procedures by period AND branch
      const periodBranchMap = new Map<string, Map<Branch, number>>();

      for (const entry of classEntries) {
        const label = getPeriodLabel(entry.date, period);
        if (!periodBranchMap.has(label)) {
          periodBranchMap.set(label, new Map());
        }
        const branchMap = periodBranchMap.get(label)!;
        branchMap.set(
          entry.branch,
          (branchMap.get(entry.branch) || 0) + entry.procedures
        );
      }

      const sortedLabels = Array.from(periodBranchMap.keys()).sort((a, b) =>
        a.localeCompare(b)
      );

      if (sortedLabels.length === 0) return { labels: [], datasets: [] };

      const activeBranches = BRANCHES.filter((b) =>
        classEntries.some((e) => e.branch === b)
      );

      const ds = activeBranches.map((branch) => ({
        label: branch,
        data: sortedLabels.map(
          (lbl) => periodBranchMap.get(lbl)?.get(branch) || 0
        ),
        backgroundColor: BRANCH_COLORS[branch],
        borderRadius: 4,
        barPercentage: 0.85,
        categoryPercentage: 0.75,
      }));

      return { labels: sortedLabels, datasets: ds };
    }
  }, [period, classEntries, branchFilter]);

  if (labels.length === 0) {
    return null;
  }

  const chartData: any = { labels, datasets };

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
          padding: 12,
          font: { size: 10 },
        },
      },
      tooltip: {
        callbacks: {
          title: (items: any[]) => {
            if (items.length > 0) {
              return `${items[0].label} (${periodLabelText})`;
            }
            return "";
          },
          label: (ctx: any) => {
            const label = ctx.dataset.label || "";
            const val = ctx.parsed.y;
            return `${label}: ${val} procedures`;
          },
          afterBody: (items: any[]) => {
            // Only show class breakdown in global view (when no branchFilter)
            if (branchFilter) return;

            const periodLabel = items[0]?.label;
            if (!periodLabel) return;

            const branch = items[0]?.dataset?.label as Branch;
            if (!branch) return;

            const branchData = classBreakdown.get(periodLabel)?.get(branch);
            if (!branchData || branchData.size === 0) return;

            const lines: string[] = ["─── Class Breakdown ───"];
            for (const [cls, count] of branchData.entries()) {
              if (count > 0) {
                lines.push(`  ${cls}: ${count}`);
              }
            }
            return lines;
          },
          footer: (items: any[]) => {
            if (branchFilter) return;

            const periodLabel = items[0]?.label;
            if (!periodLabel) return;

            // Show total procedures for this period across all branches
            let total = 0;
            for (const entry of classEntries) {
              if (getPeriodLabel(entry.date, period) === periodLabel) {
                total += entry.procedures;
              }
            }
            return total > 0 ? `Total: ${total} procedures` : "";
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Procedures",
          font: { size: 11 },
        },
        ticks: {
          font: { size: 10 },
          precision: 0,
        },
        grid: { color: "#f0f0f0" },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">
          {branchFilter
            ? `${branchFilter} - Class-wise Procedures`
            : "Branch Procedure Comparison"}
        </h2>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Grouped by {periodLabelText}
        </span>
      </div>
      <div className="h-72">
        <Bar data={chartData} options={options} />
      </div>
      <p className="text-[11px] text-gray-400 mt-2 text-center">
        {branchFilter
          ? `Showing procedure count by class per ${periodLabelText.toLowerCase()}`
          : `Shows which branch performed the most procedures per ${periodLabelText.toLowerCase()}. Hover for class-wise breakdown.`}
      </p>
    </div>
  );
}

