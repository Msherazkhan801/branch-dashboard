"use client";

import { ExtraExpenseEntry } from "@/types";

interface ExtraExpenseTableProps {
  entries: ExtraExpenseEntry[];
  onDelete: (id: number) => void;
}

export default function ExtraExpenseTable({ entries, onDelete }: ExtraExpenseTableProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="font-semibold text-gray-800 mb-2">Extra Expenses</h2>
        <p className="text-sm text-gray-400">No extra expense entries yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
      <h2 className="font-semibold text-gray-800 p-4 border-b border-gray-100">
        Extra Expenses
      </h2>
      <div className="overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-3">Branch</th>
              <th className="p-3">Date</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3">{entry.branch}</td>
                <td className="p-3">{entry.date}</td>
                <td className="p-3">{entry.category}</td>
                <td className="p-3">${entry.amount.toLocaleString()}</td>
                <td className="p-3">
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

