"use client";

import { BranchStatsMap, Branch } from "@/types";
import { BRANCHES, BRANCH_COLORS } from "@/lib/constants";

interface BranchTableProps {
  stats: BranchStatsMap;
}

export default function BranchTable({ stats }: BranchTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
      <h2 className="font-semibold text-gray-800 p-4 border-b border-gray-100">
        Branch Summary
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-3">Branch</th>
              <th className="p-3">Income</th>
              <th className="p-3">Expenses</th>
              <th className="p-3">Net Profit</th>
              <th className="p-3">Procedures</th>
              <th className="p-3">Customers</th>
            </tr>
          </thead>
          <tbody>
            {BRANCHES.map((branch) => {
              const s = stats[branch];
              const net = s.income - s.expense;
              return (
                <tr key={branch} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: BRANCH_COLORS[branch as Branch] }}
                    />
                    {branch}
                  </td>
                  <td className="p-3">${s.income.toLocaleString()}</td>
                  <td className="p-3">${s.expense.toLocaleString()}</td>
                  <td className={`p-3 font-medium ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${net.toLocaleString()}
                  </td>
                  <td className="p-3">{s.procedures}</td>
                  <td className="p-3">{s.customers}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

