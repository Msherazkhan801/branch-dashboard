"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { BRANCHES, BRANCH_COLORS } from "@/lib/constants";
import { BranchStatsMap } from "@/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface ChartsSectionProps {
  stats: BranchStatsMap;
}

export default function ChartsSection({ stats }: ChartsSectionProps) {
  const labels = BRANCHES;
  const colors = labels.map((b) => BRANCH_COLORS[b]);

  const salesData = {
    labels,
    datasets: [
      {
        label: "Income",
        data: labels.map((b) => stats[b].income),
        backgroundColor: colors,
      },
    ],
  };

  const customersData = {
    labels,
    datasets: [
      {
        label: "Customers",
        data: labels.map((b) => stats[b].customers),
        backgroundColor: colors,
      },
    ],
  };

  const procData = {
    labels,
    datasets: [
      {
        data: labels.map((b) => stats[b].procedures),
        backgroundColor: colors,
      },
    ],
  };

  const compareData = {
    labels,
    datasets: [
      {
        label: "Net Profit/Loss",
        data: labels.map((b) => stats[b].income - stats[b].expense),
        backgroundColor: labels.map((b) =>
          stats[b].income - stats[b].expense >= 0 ? "#2E9E5B" : "#E15554"
        ),
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-2">Income by Branch</h2>
        <div className="h-56">
          <Bar
            data={salesData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-2">Customers by Branch</h2>
        <div className="h-56">
          <Bar
            data={customersData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-2">Procedures Share</h2>
        <div className="h-56">
          <Pie
            data={procData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-2">Net Profit / Loss</h2>
        <div className="h-56">
          <Bar
            data={compareData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>
    </div>
  );
}

