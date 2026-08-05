"use client";

import { useEffect, useState } from "react";
import { Branch, ClassIncomeEntry } from "@/types";
import { BRANCHES, CLASSES } from "@/lib/constants";

interface AddClassIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<ClassIncomeEntry, "id">, id?: string) => void;
  initialEntry?: ClassIncomeEntry | null;
  fixedBranch?: Branch;
}

export default function AddClassIncomeModal({ isOpen, onClose, onSave, initialEntry = null, fixedBranch }: AddClassIncomeModalProps) {
  const [branch, setBranch] = useState<Branch>(initialEntry?.branch ?? fixedBranch ?? BRANCHES[0]);
  const [date, setDate] = useState(initialEntry?.date ?? new Date().toISOString().split("T")[0]);
  const [procClass, setProcClass] = useState(initialEntry?.procClass ?? CLASSES[0]);
  const [procedures, setProcedures] = useState(String(initialEntry?.procedures ?? ""));
  const [customers, setCustomers] = useState(String(initialEntry?.customers ?? ""));
  const [income, setIncome] = useState(String(initialEntry?.income ?? ""));

  useEffect(() => {
    if (initialEntry) {
      setBranch(initialEntry.branch);
      setDate(initialEntry.date);
      setProcClass(initialEntry.procClass);
      setProcedures(String(initialEntry.procedures));
      setCustomers(String(initialEntry.customers));
      setIncome(String(initialEntry.income));
    } else {
      setBranch(fixedBranch ?? BRANCHES[0]);
      setDate(new Date().toISOString().split("T")[0]);
      setProcClass(CLASSES[0]);
      setProcedures("");
      setCustomers("");
      setIncome("");
    }
  }, [initialEntry, isOpen, fixedBranch]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedures || !customers || !income) return;

    onSave(
      {
        branch,
        date,
        procClass,
        procedures: Number(procedures),
        customers: Number(customers),
        income: Number(income),
        returnedCustomers: initialEntry?.returnedCustomers ?? 0,
        returnedAmount: initialEntry?.returnedAmount ?? 0,
      },
      initialEntry?.id
    );

    setBranch(fixedBranch ?? BRANCHES[0]);
    setDate(new Date().toISOString().split("T")[0]);
    setProcClass(CLASSES[0]);
    setProcedures("");
    setCustomers("");
    setIncome("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{initialEntry ? "Edit Class Income" : "Add Class Income"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!fixedBranch && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as Branch)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={procClass}
              onChange={(e) => setProcClass(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Procedures</label>
              <input
                type="number"
                min="0"
                value={procedures}
                onChange={(e) => setProcedures(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
                placeholder="e.g. 5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customers</label>
              <input
                type="number"
                min="0"
                value={customers}
                onChange={(e) => setCustomers(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
                placeholder="e.g. 3"
                required
              />
            </div>
          </div> {/* <--- Added missing closing div for grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Income ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
              placeholder="e.g. 2000"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-[#16324F] rounded-lg hover:bg-[#0f2439]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div> /* <--- Added missing closing div for backdrop */
  );
}