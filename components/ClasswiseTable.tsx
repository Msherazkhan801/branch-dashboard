"use client";

import { ClassExpenseEntry } from "@/types";

interface ClasswiseTableProps {
  entries: ClassExpenseEntry[];
  onDelete: (id: string) => void;
}

export default function ClasswiseTable({ entries, onDelete }: ClasswiseTableProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="font-semibold text-gray-800 mb-2">Class-wise Expenses</h2>
        <p className="text-sm text-gray-400">No class expense entries yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
      <h2 className="font-semibold text-gray-800 p-4 border-b border-gray-100">
        Class-wise Expenses
      </h2>
      <div className="overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-3">Branch</th>
              <th className="p-3">Date</th>
              <th className="p-3">Class</th>
              <th className="p-3">Procedures</th>
              <th className="p-3">Customers</th>
              <th className="p-3">Expense</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3">{entry.branch}</td>
                <td className="p-3">{entry.date}</td>
                <td className="p-3">{entry.procClass}</td>
                <td className="p-3">{entry.procedures}</td>
                <td className="p-3">{entry.customers}</td>
                <td className="p-3">${entry.expense.toLocaleString()}</td>
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

