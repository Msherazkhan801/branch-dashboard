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
import { ClassIncomeEntry } from "@/types";
import { BRANCHES, BRANCH_COLORS, CLASSES } from "@/lib/constants";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ClassProcedureComparisonProps {
  classEntries: ClassIncomeEntry[];
}

export default function ClassProcedureComparison({ classEntries }: ClassProcedureComparisonProps) {
  // Aggregate procedures by class and branch
  const { labels, datasets } = useMemo(() => {
    // Build a map: class -> branch -> total procedures
    const classBranchMap = new Map<string, Map<string, number>>();

    for (const entry of classEntries) {
      if (!classBranchMap.has(entry.procClass)) {
        classBranchMap.set(entry.procClass, new Map());
      }
      const branchMap = classBranchMap.get(entry.procClass)!;
      branchMap.set(
        entry.branch,
        (branchMap.get(entry.branch) || 0) + entry.procedures
      );
    }

    // Determine which classes have data, ordered by CLASSES list
    const activeClasses = CLASSES.filter((c) => classBranchMap.has(c));

    if (activeClasses.length === 0) {
      return { labels: [], datasets: [] };
    }

    const ds = BRANCHES.map((branch) => ({
      label: branch,
      data: activeClasses.map((cls) => classBranchMap.get(cls)?.get(branch) || 0),
      backgroundColor: BRANCH_COLORS[branch],
      borderRadius: 4,
      barPercentage: 0.7,
      categoryPercentage: 0.8,
    }));

    return { labels: activeClasses, datasets: ds };
  }, [classEntries]);

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
              return items[0].label;
            }
            return "";
          },
          label: (ctx: any) => {
            const branch = ctx.dataset.label || "";
            const val = ctx.parsed.y;
            return `${branch}: ${val} procedures`;
          },
          footer: (items: any[]) => {
            if (items.length > 0) {
              const cls = items[0].label;
              let total = 0;
              for (const ds of items) {
                total += ds.parsed.y;
              }
              return total > 0 ? `Total: ${total} procedures` : "";
            }
            return "";
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
        ticks: {
          font: { size: 9 },
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
        <h2 className="font-semibold text-gray-800">Class Procedure Comparison</h2>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Branch vs Procedure Class
        </span>
      </div>
      <div className="h-72">
        <Bar data={chartData} options={options} />
      </div>
      <p className="text-[11px] text-gray-400 mt-2 text-center">
        Shows which branch performs the most procedures per class. Hover for details.
      </p>
    </div>
  );
}

