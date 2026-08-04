"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { HeadOfficeExpenseEntry, Period } from "@/types";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { exportToXLSX } from "@/lib/exportUtils";
import {
  fetchHeadOfficeExpenseEntries,
  addHeadOfficeExpenseEntry,
  deleteHeadOfficeExpenseEntry,
  updateHeadOfficeExpenseEntry,
  fetchCategories,
  saveCategories,
} from "@/lib/firestoreService";
import HeadOfficeExpenseTable from "@/components/HeadOfficeExpenseTable";
import HeadOfficeExpenseGraph from "@/components/HeadOfficeExpenseGraph";
import AddHeadOfficeExpenseModal from "@/components/modals/AddHeadOfficeExpenseModal";

export default function HeadOfficePage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("create");
  const canEdit = hasPermission("edit");
  const canDelete = hasPermission("delete");

  const [period, setPeriod] = useState<Period>("daily");
  const [entries, setEntries] = useState<HeadOfficeExpenseEntry[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HeadOfficeExpenseEntry | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [hoEntries, cats] = await Promise.all([
          fetchHeadOfficeExpenseEntries(),
          fetchCategories(),
        ]);
        setEntries(hoEntries);
        setCategories(cats);
      } catch (err) {
        console.error("Error loading head office data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = useCallback(
    async (entry: Omit<HeadOfficeExpenseEntry, "id">, id?: string) => {
      try {
        if (id) {
          await updateHeadOfficeExpenseEntry(id, entry);
          setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...entry } : e)));
        } else {
          const saved = await addHeadOfficeExpenseEntry(entry);
          setEntries((prev) => [saved, ...prev]);
        }
        if (!categories.includes(entry.category)) {
          const updated = [...categories, entry.category];
          setCategories(updated);
          await saveCategories(updated);
        }
      } catch (err) {
        console.error("Error saving head office expense:", err);
      }
    },
    [categories]
  );

  const handleEdit = useCallback((entry: HeadOfficeExpenseEntry) => {
    setEditingEntry(entry);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteHeadOfficeExpenseEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting head office expense:", err);
    }
  }, []);

  const filteredEntries = useMemo(() => {
    if (!startDate && !endDate) return entries;
    return entries.filter((e) => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [entries, startDate, endDate]);

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#16324F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading head office data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">Head Office</h1>
          <p className="text-xs text-slate-500 capitalize">{period} Overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white border rounded-lg overflow-hidden border-slate-200">
            {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  period === p
                    ? "bg-[#16324F] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs border border-slate-300 rounded px-1.5 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-[#16324F]"
            />
            <span className="text-xs text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs border border-slate-300 rounded px-1.5 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-[#16324F]"
            />
            {(startDate || endDate) && (
              <button onClick={clearDateFilter} className="text-xs text-red-500 hover:text-red-700 font-medium ml-1">
                Clear
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setEditingEntry(null);
              setShowModal(true);
            }}
            disabled={!canCreate}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              canCreate
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            + Head Office Expense
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-800">Head Office Expenses</h2>
          {filteredEntries.length > 0 && (
            <button
              onClick={() =>
                exportToXLSX(
                  filteredEntries.map((e) => ({
                    Date: e.date,
                    Category: e.category,
                    Amount: e.amount,
                  })),
                  "head-office-expenses"
                )
              }
              className="px-2.5 py-1 text-xs font-medium bg-[#16324F] text-white rounded hover:bg-[#0f2439] transition-colors"
            >
              Download XLSX
            </button>
          )}
        </div>
        <HeadOfficeExpenseTable
          entries={filteredEntries}
          onDelete={canDelete ? handleDelete : () => {} }
          onEdit={canEdit ? handleEdit : () => {} }
        />
      </div>

      <div className="mb-6">
        <HeadOfficeExpenseGraph period={period} entries={filteredEntries} />
      </div>

      <AddHeadOfficeExpenseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEntry(null);
        }}
        onSave={handleSave}
        categories={categories}
        initialEntry={editingEntry}
      />
    </>
  );
}
