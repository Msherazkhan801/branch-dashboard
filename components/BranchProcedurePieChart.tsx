/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { ClassIncomeEntry, Branch } from "@/types";
import { CLASSES } from "@/lib/constants";

ChartJS.register(ArcElement, Title, Tooltip, Legend);

// Distinct colors for procedure classes
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

interface BranchProcedurePieChartProps {
  branch: Branch;
  classEntries: ClassIncomeEntry[];
}

export default function BranchProcedurePieChart({ branch, classEntries }: BranchProcedurePieChartProps) {
  const { labels, dataValues, colors } = useMemo(() => {
    // Filter entries for this branch
    const branchEntries = classEntries.filter((e) => e.branch === branch);

    // Aggregate procedures by class
    const classMap = new Map<string, number>();
    for (const entry of branchEntries) {
      classMap.set(
        entry.procClass,
        (classMap.get(entry.procClass) || 0) + entry.procedures
      );
    }

    // Order by CLASSES list
    const activeClasses = CLASSES.filter((c) => classMap.has(c));
    const labels = activeClasses;
    const dataValues = activeClasses.map((c) => classMap.get(c) || 0);
    const colors = activeClasses.map((_, idx) => CLASS_COLORS[idx % CLASS_COLORS.length]);

    return { labels, dataValues, colors };
  }, [branch, classEntries]);

  if (labels.length === 0) {
    return null;
  }

  const chartData: any = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 10,
          font: { size: 9 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.label || "";
            const val = ctx.parsed;
            const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
            return ` ${label}: ${val} procedures (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">{branch} - Procedure Distribution</h2>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Pie Chart
        </span>
      </div>
      <div className="h-72 flex items-center justify-center">
        <div className="w-full h-full max-w-md mx-auto">
          <Pie data={chartData} options={options} />
        </div>
      </div>
      <p className="text-[11px] text-gray-400 mt-2 text-center">
        Distribution of procedures by class for {branch}. Hover for details.
      </p>
    </div>
  );
}

