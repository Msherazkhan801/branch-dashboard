"use client";

import { useEffect, useState } from "react";
import { Branch, ExtraExpenseEntry } from "@/types";
import { BRANCHES, DEFAULT_CATEGORIES } from "@/lib/constants";

interface AddExtraExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<ExtraExpenseEntry, "id">, id?: string) => void;
  categories: string[];
  initialEntry?: ExtraExpenseEntry | null;
}

export default function AddExtraExpenseModal({ isOpen, onClose, onSave, categories, initialEntry = null }: AddExtraExpenseModalProps) {
  const [branch, setBranch] = useState<Branch>(initialEntry?.branch ?? BRANCHES[0]);
  const [date, setDate] = useState(initialEntry?.date ?? new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState((initialEntry?.category ?? categories[0]) || DEFAULT_CATEGORIES[0]);
  const [amount, setAmount] = useState(String(initialEntry?.amount ?? ""));
  const [newCategory, setNewCategory] = useState("");
  const [useNewCategory, setUseNewCategory] = useState(false);

  useEffect(() => {
    if (initialEntry) {
      setBranch(initialEntry.branch);
      setDate(initialEntry.date);
      setCategory(initialEntry.category);
      setAmount(String(initialEntry.amount));
      setUseNewCategory(false);
      setNewCategory("");
    } else {
      setBranch(BRANCHES[0]);
      setDate(new Date().toISOString().split("T")[0]);
      setCategory(categories[0] || DEFAULT_CATEGORIES[0]);
      setAmount("");
      setNewCategory("");
      setUseNewCategory(false);
    }
  }, [initialEntry, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const finalCategory = useNewCategory ? newCategory : category;

    onSave(
      {
        branch,
        date,
        category: finalCategory,
        amount: Number(amount),
      },
      initialEntry?.id
    );

    setBranch(BRANCHES[0]);
    setDate(new Date().toISOString().split("T")[0]);
    setCategory(categories[0] || DEFAULT_CATEGORIES[0]);
    setAmount("");
    setNewCategory("");
    setUseNewCategory(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{initialEntry ? "Edit Extra Expense" : "Add Extra Expense"}</h2>
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <button
                type="button"
                onClick={() => setUseNewCategory(!useNewCategory)}
                className="text-xs text-[#1FA2A6] hover:underline"
              >
                {useNewCategory ? "Use existing" : "+ New category"}
              </button>
            </div>
            {useNewCategory ? (
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
                placeholder="Enter new category"
                required
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
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
              placeholder="e.g. 500"
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

