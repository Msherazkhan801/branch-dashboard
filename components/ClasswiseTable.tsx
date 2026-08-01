"use client";

import { useState } from "react";
import { ClassIncomeEntry } from "@/types";
import ReturnClassIncomeModal from "@/components/modals/ReturnClassIncomeModal";

interface ClasswiseTableProps {
  entries: ClassIncomeEntry[];
  onDelete: (id: string) => void;
  onReturn: (id: string, returnedCustomers: number, returnedAmount: number) => void;
}

export default function ClasswiseTable({ entries, onDelete, onReturn }: ClasswiseTableProps) {
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ClassIncomeEntry | null>(null);

  const handleReturnClick = (entry: ClassIncomeEntry) => {
    setSelectedEntry(entry);
    setReturnModalOpen(true);
  };

  const handleReturnClose = () => {
    setReturnModalOpen(false);
    setSelectedEntry(null);
  };

  // Quick action: return exactly 1 customer with proportional refund
  const handleReturnOne = (entry: ClassIncomeEntry) => {
    const remainingCustomers = entry.customers - (entry.returnedCustomers || 0);
    const remainingIncome = entry.income - (entry.returnedAmount || 0);
    if (remainingCustomers <= 0) {
      alert("No remaining customers to return for this entry.");
      return;
    }
    const perCustomerAmount = remainingIncome / remainingCustomers;
    const refund = Math.round(perCustomerAmount * 100) / 100;
    if (window.confirm(`Return 1 customer with a $${refund.toLocaleString()} refund?`)) {
      onReturn(entry.id, 1, refund);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="font-semibold text-gray-800 mb-2">Class-wise Income</h2>
        <p className="text-sm text-gray-400">No class income entries yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
        <h2 className="font-semibold text-gray-800 p-4 border-b border-gray-100">
          Class-wise Income
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
                <th className="p-3">Income</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const netIncome = entry.income - (entry.returnedAmount || 0);
                const hasReturns = (entry.returnedAmount || 0) > 0;
                const remainingCustomers = entry.customers - (entry.returnedCustomers || 0);
                return (
                  <tr
                    key={entry.id}
                    className={`border-t border-gray-100 ${
                      hasReturns ? "bg-red-600 text-white" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-3">{entry.branch}</td>
                    <td className="p-3">{entry.date}</td>
                    <td className="p-3">{entry.procClass}</td>
                    <td className="p-3">{entry.procedures}</td>
                    <td className="p-3">
                      {hasReturns && remainingCustomers > 0 ? (
                        <span>
                          <span className="text-red-200 line-through mr-1">{entry.customers}</span>
                          <span className="font-medium">{remainingCustomers}</span>
                        </span>
                      ) : (
                        <span>{entry.customers}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {hasReturns ? (
                        <span>
                          <span className="text-red-200 line-through mr-1">${entry.income.toLocaleString()}</span>
                          <span className="font-bold">${netIncome.toLocaleString()}</span>
                        </span>
                      ) : (
                        <span className="font-medium">${entry.income.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {hasReturns && remainingCustomers <= 0 ? (
                          <span className="text-xs text-red-100 font-medium">Fully Returned</span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleReturnOne(entry)}
                              className="text-xs font-medium text-yellow-200 hover:text-yellow-100 border border-yellow-200/60 rounded px-1.5 py-0.5 hover:bg-red-700"
                            >
                              Return 1
                            </button>
                            <button
                              onClick={() => handleReturnClick(entry)}
                              className={`text-xs font-medium ${
                                hasReturns ? "text-yellow-200 hover:text-yellow-100" : "text-orange-500 hover:text-orange-700"
                              }`}
                            >
                              Return
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onDelete(entry.id)}
                          className={`text-xs font-medium ${
                            hasReturns ? "text-red-100 hover:text-white" : "text-red-500 hover:text-red-700"
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ReturnClassIncomeModal
        isOpen={returnModalOpen}
        onClose={handleReturnClose}
        onReturn={onReturn}
        entry={selectedEntry}
      />
    </>
  );
}
