"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IncomeEntry,
  ClassExpenseEntry,
  ExtraExpenseEntry,
  Period,
  Branch,
  BranchStatsMap,
} from "@/types";
import { BRANCHES, DEFAULT_CATEGORIES } from "@/lib/constants";
import {
  fetchIncomeEntries,
  addIncomeEntry,
  deleteIncomeEntry,
  fetchClassExpenseEntries,
  addClassExpenseEntry,
  deleteClassExpenseEntry,
  fetchExtraExpenseEntries,
  addExtraExpenseEntry,
  deleteExtraExpenseEntry,
  fetchCategories,
  saveCategories,
} from "@/lib/firestoreService";
import KPISection from "@/components/KPISection";
import ChartsSection from "@/components/ChartsSection";
import BranchTable from "@/components/BranchTable";
import ClasswiseTable from "@/components/ClasswiseTable";
import ExtraExpenseTable from "@/components/ExtraExpenseTable";
import AlertsList from "@/components/AlertsList";
import AddIncomeModal from "@/components/modals/AddIncomeModal";
import AddClassExpenseModal from "@/components/modals/AddClassExpenseModal";
import AddExtraExpenseModal from "@/components/modals/AddExtraExpenseModal";

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("daily");
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [classEntries, setClassEntries] = useState<ClassExpenseEntry[]>([]);
  const [extraEntries, setExtraEntries] = useState<ExtraExpenseEntry[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // Modal visibility
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Load all data from Firestore on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [income, classExp, extraExp, cats] = await Promise.all([
          fetchIncomeEntries(),
          fetchClassExpenseEntries(),
          fetchExtraExpenseEntries(),
          fetchCategories(),
        ]);
        setIncomeEntries(income);
        setClassEntries(classExp);
        setExtraEntries(extraExp);
        setCategories(cats);
      } catch (err) {
        console.error("Error loading data from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddIncome = useCallback(async (entry: Omit<IncomeEntry, "id">) => {
    try {
      const saved = await addIncomeEntry(entry);
      setIncomeEntries((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Error adding income:", err);
    }
  }, []);

  const handleAddClassExpense = useCallback(async (entry: Omit<ClassExpenseEntry, "id">) => {
    try {
      const saved = await addClassExpenseEntry(entry);
      setClassEntries((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Error adding class expense:", err);
    }
  }, []);

  const handleAddExtraExpense = useCallback(
    async (entry: Omit<ExtraExpenseEntry, "id">) => {
      try {
        const saved = await addExtraExpenseEntry(entry);
        setExtraEntries((prev) => [saved, ...prev]);
        // If user added a new category, persist it
        if (!categories.includes(entry.category)) {
          const updated = [...categories, entry.category];
          setCategories(updated);
          await saveCategories(updated);
        }
      } catch (err) {
        console.error("Error adding extra expense:", err);
      }
    },
    [categories]
  );

  const handleDeleteClassEntry = useCallback(async (id: string) => {
    try {
      await deleteClassExpenseEntry(id);
      setClassEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting class expense:", err);
    }
  }, []);

  const handleDeleteExtraEntry = useCallback(async (id: string) => {
    try {
      await deleteExtraExpenseEntry(id);
      setExtraEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting extra expense:", err);
    }
  }, []);

  const handleDeleteIncome = useCallback(async (id: string) => {
    try {
      await deleteIncomeEntry(id);
      setIncomeEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting income:", err);
    }
  }, []);

  // Compute Branch Aggregations
  const stats: BranchStatsMap = BRANCHES.reduce(
    (acc, b) => {
      const inc = incomeEntries
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.amount, 0);
      const clsExp = classEntries
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.expense, 0);
      const extExp = extraEntries
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.amount, 0);
      const procs = classEntries
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.procedures, 0);
      const custs = classEntries
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.customers, 0);

      acc[b] = {
        income: inc,
        expense: clsExp + extExp,
        procedures: procs,
        customers: custs,
      };
      return acc;
    },
    {} as BranchStatsMap
  );

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#16324F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading dashboard data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      {/* Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">
            Branch Performance Dashboard
          </h1>
          <p className="text-xs text-slate-500 capitalize">{period} Overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Toggle */}
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

          {/* Add Data Buttons */}
          <button
            onClick={() => setShowIncomeModal(true)}
            className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Income
          </button>
          <button
            onClick={() => setShowClassModal(true)}
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Class Expense
          </button>
          <button
            onClick={() => setShowExtraModal(true)}
            className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Extra Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPISection stats={stats} />

      {/* Charts */}
      <ChartsSection stats={stats} />

      {/* Branch Table */}
      <BranchTable stats={stats} />

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ClasswiseTable
          entries={classEntries}
          onDelete={handleDeleteClassEntry}
        />
        <ExtraExpenseTable
          entries={extraEntries}
          onDelete={handleDeleteExtraEntry}
        />
      </div>

      {/* Alerts */}
      <AlertsList stats={stats} />

      {/* Income Section */}
      {incomeEntries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
          <h2 className="font-semibold text-gray-800 p-4 border-b border-gray-100">
            Income Entries
          </h2>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-3">Branch</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomeEntries.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-3">{entry.branch}</td>
                    <td className="p-3">{entry.date}</td>
                    <td className="p-3 font-medium text-green-600">
                      ${entry.amount.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteIncome(entry.id)}
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
      )}

      {/* Modals */}
      <AddIncomeModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSave={handleAddIncome}
      />
      <AddClassExpenseModal
        isOpen={showClassModal}
        onClose={() => setShowClassModal(false)}
        onSave={handleAddClassExpense}
      />
      <AddExtraExpenseModal
        isOpen={showExtraModal}
        onClose={() => setShowExtraModal(false)}
        onSave={handleAddExtraExpense}
        categories={categories}
      />
    </main>
  );
}

