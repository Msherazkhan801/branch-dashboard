"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  IncomeEntry,
  ClassExpenseEntry,
  ExtraExpenseEntry,
  Period,
  Branch,
  BranchStatsMap,
} from "@/types";
import { BRANCHES, DEFAULT_CATEGORIES } from "@/lib/constants";
import { exportToXLSX } from "@/lib/exportUtils";
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

  // Date range filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // Filtered entries based on date range
  const filteredIncome = useMemo(() => {
    if (!startDate && !endDate) return incomeEntries;
    return incomeEntries.filter((e) => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [incomeEntries, startDate, endDate]);

  const filteredClass = useMemo(() => {
    if (!startDate && !endDate) return classEntries;
    return classEntries.filter((e) => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [classEntries, startDate, endDate]);

  const filteredExtra = useMemo(() => {
    if (!startDate && !endDate) return extraEntries;
    return extraEntries.filter((e) => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [extraEntries, startDate, endDate]);

  // Compute Branch Aggregations from FILTERED data
  const stats: BranchStatsMap = BRANCHES.reduce(
    (acc, b) => {
      const inc = filteredIncome
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.amount, 0);
      const clsExp = filteredClass
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.expense, 0);
      const extExp = filteredExtra
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.amount, 0);
      const procs = filteredClass
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.procedures, 0);
      const custs = filteredClass
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

  // Helper to clear date filters
  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

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

          {/* Date Range Filter */}
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
              <button
                onClick={clearDateFilter}
                className="text-xs text-red-500 hover:text-red-700 font-medium ml-1"
              >
                Clear
              </button>
            )}
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-800">Class-wise Expenses</h2>
            {filteredClass.length > 0 && (
              <button
                onClick={() =>
                  exportToXLSX(
                    filteredClass.map((e) => ({
                      Branch: e.branch,
                      Date: e.date,
                      Class: e.procClass,
                      Procedures: e.procedures,
                      Customers: e.customers,
                      Expense: e.expense,
                    })),
                    "class-expenses"
                  )
                }
                className="px-2.5 py-1 text-xs font-medium bg-[#16324F] text-white rounded hover:bg-[#0f2439] transition-colors"
              >
                Download XLSX
              </button>
            )}
          </div>
          <ClasswiseTable
            entries={filteredClass}
            onDelete={handleDeleteClassEntry}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-800">Extra Expenses</h2>
            {filteredExtra.length > 0 && (
              <button
                onClick={() =>
                  exportToXLSX(
                    filteredExtra.map((e) => ({
                      Branch: e.branch,
                      Date: e.date,
                      Category: e.category,
                      Amount: e.amount,
                    })),
                    "extra-expenses"
                  )
                }
                className="px-2.5 py-1 text-xs font-medium bg-[#16324F] text-white rounded hover:bg-[#0f2439] transition-colors"
              >
                Download XLSX
              </button>
            )}
          </div>
          <ExtraExpenseTable
            entries={filteredExtra}
            onDelete={handleDeleteExtraEntry}
          />
        </div>
      </div>

      {/* Alerts */}
      <AlertsList stats={stats} />

      {/* Income Section */}
      {filteredIncome.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">
              Income Entries
            </h2>
            <button
              onClick={() =>
                exportToXLSX(
                  filteredIncome.map((e) => ({
                    Branch: e.branch,
                    Date: e.date,
                    Amount: e.amount,
                  })),
                  "income-entries"
                )
              }
              className="px-2.5 py-1 text-xs font-medium bg-[#16324F] text-white rounded hover:bg-[#0f2439] transition-colors"
            >
              Download XLSX
            </button>
          </div>
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
                {filteredIncome.map((entry) => (
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

