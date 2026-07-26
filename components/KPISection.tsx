"use client";

import { BranchStatsMap } from "@/types";
import { BRANCHES } from "@/lib/constants";

interface KPISectionProps {
  stats: BranchStatsMap;
}

export default function KPISection({ stats }: KPISectionProps) {
  const totals = BRANCHES.reduce(
    (acc, b) => ({
      income: acc.income + stats[b].income,
      expense: acc.expense + stats[b].expense,
      procedures: acc.procedures + stats[b].procedures,
      customers: acc.customers + stats[b].customers,
    }),
    { income: 0, expense: 0, procedures: 0, customers: 0 }
  );

  const profit = totals.income - totals.expense;

  const cards = [
    { label: "Total Income", value: `$${totals.income.toLocaleString()}`, color: "text-green-600" },
    { label: "Total Expenses", value: `$${totals.expense.toLocaleString()}`, color: "text-red-600" },
    { label: "Net Profit", value: `$${profit.toLocaleString()}`, color: profit >= 0 ? "text-green-700" : "text-red-700" },
    { label: "Total Procedures", value: totals.procedures.toLocaleString(), color: "text-blue-600" },
    { label: "Total Customers", value: totals.customers.toLocaleString(), color: "text-purple-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
        >
          <p className="text-xs text-gray-500 uppercase tracking-wide">{card.label}</p>
          <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

