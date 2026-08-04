"use client";

import { useEffect, useState } from "react";
import { Branch, IncomeEntry } from "@/types";
import { BRANCHES } from "@/lib/constants";

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<IncomeEntry, "id">, id?: string) => void;
  initialEntry?: IncomeEntry | null;
}

export default function AddIncomeModal({ isOpen, onClose, onSave, initialEntry = null }: AddIncomeModalProps) {
  const [branch, setBranch] = useState<Branch>(initialEntry?.branch ?? BRANCHES[0]);
  const [date, setDate] = useState(initialEntry?.date ?? new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState(initialEntry ? String(initialEntry.amount) : "");

  useEffect(() => {
    if (initialEntry) {
      setBranch(initialEntry.branch);
      setDate(initialEntry.date);
      setAmount(String(initialEntry.amount));
    } else {
      setBranch(BRANCHES[0]);
      setDate(new Date().toISOString().split("T")[0]);
      setAmount("");
    }
  }, [initialEntry, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    onSave(
      {
        branch,
        date,
        amount: Number(amount),
      },
      initialEntry?.id
    );

    setBranch(BRANCHES[0]);
    setDate(new Date().toISOString().split("T")[0]);
    setAmount("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{initialEntry ? "Edit Income" : "Add Income"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
              placeholder="e.g. 15000"
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
    </div>
  );
}

