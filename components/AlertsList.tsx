"use client";

import { BranchStatsMap, Branch } from "@/types";
import { BRANCHES } from "@/lib/constants";

interface AlertsListProps {
  stats: BranchStatsMap;
}

export default function AlertsList({ stats }: AlertsListProps) {
  const alerts: { branch: Branch; message: string; type: "warning" | "info" | "error" }[] = [];

  BRANCHES.forEach((branch) => {
    const s = stats[branch];
    const net = s.income - s.expense;

    if (net < 0) {
      alerts.push({
        branch,
        message: `Loss of $${Math.abs(net).toLocaleString()} — expenses exceed income.`,
        type: "error",
      });
    } else if (net === 0) {
      alerts.push({
        branch,
        message: `Break-even — no profit or loss.`,
        type: "warning",
      });
    }

    if (s.customers === 0 && s.procedures > 0) {
      alerts.push({
        branch,
        message: `Procedures recorded (${s.procedures}) but no customers logged.`,
        type: "warning",
      });
    }
  });

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
        <h2 className="font-semibold text-gray-800 mb-2">Alerts</h2>
        <p className="text-sm text-green-600">All branches are performing well. No alerts.</p>
      </div>
    );
  }

  const typeStyles = {
    error: "border-l-red-500 bg-red-50",
    warning: "border-l-yellow-500 bg-yellow-50",
    info: "border-l-blue-500 bg-blue-50",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
      <h2 className="font-semibold text-gray-800 mb-3">Alerts ({alerts.length})</h2>
      <div className="space-y-2">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className={`border-l-4 p-3 rounded-r-lg text-sm ${typeStyles[alert.type]}`}
          >
            <span className="font-medium">{alert.branch}:</span> {alert.message}
          </div>
        ))}
      </div>
    </div>
  );
}

