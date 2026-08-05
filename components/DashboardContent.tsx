"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  IncomeEntry,
  ClassIncomeEntry,
  ExtraExpenseEntry,
  HeadOfficeExpenseEntry,
  Period,
  Branch,
  BranchStatsMap,
} from "@/types";
import { useAuth } from "@/components/AuthProvider";
import { BRANCHES, DEFAULT_CATEGORIES } from "@/lib/constants";
import { exportToXLSX } from "@/lib/exportUtils";
import {
  fetchIncomeEntries,
  addIncomeEntry,
  deleteIncomeEntry,
  updateIncomeEntry,
  fetchClassIncomeEntries,
  addClassIncomeEntry,
  deleteClassIncomeEntry,
  updateClassIncomeEntry,
  fetchExtraExpenseEntries,
  addExtraExpenseEntry,
  deleteExtraExpenseEntry,
  updateExtraExpenseEntry,
  fetchHeadOfficeExpenseEntries,
  addHeadOfficeExpenseEntry,
  deleteHeadOfficeExpenseEntry,
  updateHeadOfficeExpenseEntry,
  fetchCategories,
  saveCategories,
} from "@/lib/firestoreService";
import KPISection from "@/components/KPISection";
import ChartsSection from "@/components/ChartsSection";
import BranchTable from "@/components/BranchTable";
import ClasswiseTable from "@/components/ClasswiseTable";
import ExtraExpenseTable from "@/components/ExtraExpenseTable";
import HeadOfficeExpenseTable from "@/components/HeadOfficeExpenseTable";
import HeadOfficeExpenseGraph from "@/components/HeadOfficeExpenseGraph";
import AlertsList from "@/components/AlertsList";
import BranchTrendGraph from "@/components/BranchTrendGraph";
import ClassProcedureComparison from "@/components/ClassProcedureComparison";
import BranchProcedurePieChart from "@/components/BranchProcedurePieChart";
import Authorized from "@/components/Authorized";
import AddIncomeModal from "@/components/modals/AddIncomeModal";
import AddClassIncomeModal from "@/components/modals/AddClassIncomeModal";
import AddExtraExpenseModal from "@/components/modals/AddExtraExpenseModal";
import AddHeadOfficeExpenseModal from "@/components/modals/AddHeadOfficeExpenseModal";

interface DashboardContentProps {
  branchFilter?: Branch;
  title?: string;
}

export default function DashboardContent({ branchFilter, title }: DashboardContentProps) {
  const [period, setPeriod] = useState<Period>("daily");
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [classEntries, setClassEntries] = useState<ClassIncomeEntry[]>([]);
  const [extraEntries, setExtraEntries] = useState<ExtraExpenseEntry[]>([]);
  const [headOfficeEntries, setHeadOfficeEntries] = useState<HeadOfficeExpenseEntry[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showHeadOfficeModal, setShowHeadOfficeModal] = useState(false);
  const [editingIncomeEntry, setEditingIncomeEntry] = useState<IncomeEntry | null>(null);
  const [editingClassEntry, setEditingClassEntry] = useState<ClassIncomeEntry | null>(null);
  const [editingExtraEntry, setEditingExtraEntry] = useState<ExtraExpenseEntry | null>(null);
  const [editingHeadOfficeEntry, setEditingHeadOfficeEntry] = useState<HeadOfficeExpenseEntry | null>(null);

  const { hasPermission } = useAuth();
  const canCreate = hasPermission("create");
  const canEdit = hasPermission("edit");
  const canDelete = hasPermission("delete");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showTrend, setShowTrend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [income, classInc, extraExp, headOfficeExp, cats] = await Promise.all([
          fetchIncomeEntries(),
          fetchClassIncomeEntries(),
          fetchExtraExpenseEntries(),
          fetchHeadOfficeExpenseEntries(),
          fetchCategories(),
        ]);
        setIncomeEntries(income);
        setClassEntries(classInc);
        setExtraEntries(extraExp);
        setHeadOfficeEntries(headOfficeExp);
        setCategories(cats);
      } catch (err) {
        console.error("Error loading data from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveIncome = useCallback(async (entry: Omit<IncomeEntry, "id">, id?: string) => {
    try {
      if (id) {
        await updateIncomeEntry(id, entry);
        setIncomeEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...entry } : e)));
      } else {
        const saved = await addIncomeEntry(entry);
        setIncomeEntries((prev) => [saved, ...prev]);
      }
    } catch (err) {
      console.error("Error saving income entry:", err);
    }
  }, []);

  const handleSaveClassIncome = useCallback(async (entry: Omit<ClassIncomeEntry, "id">, id?: string) => {
    try {
      if (id) {
        await updateClassIncomeEntry(id, entry);
        setClassEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...entry } : e)));
      } else {
        const saved = await addClassIncomeEntry(entry);
        setClassEntries((prev) => [saved, ...prev]);
      }
    } catch (err) {
      console.error("Error saving class income:", err);
    }
  }, []);

  const handleSaveExtraExpense = useCallback(
    async (entry: Omit<ExtraExpenseEntry, "id">, id?: string) => {
      try {
        if (id) {
          await updateExtraExpenseEntry(id, entry);
          setExtraEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...entry } : e)));
        } else {
          const saved = await addExtraExpenseEntry(entry);
          setExtraEntries((prev) => [saved, ...prev]);
        }

        if (!categories.includes(entry.category)) {
          const updated = [...categories, entry.category];
          setCategories(updated);
          await saveCategories(updated);
        }
      } catch (err) {
        console.error("Error saving extra expense:", err);
      }
    },
    [categories]
  );

  const handleSaveHeadOfficeExpense = useCallback(
    async (entry: Omit<HeadOfficeExpenseEntry, "id">, id?: string) => {
      try {
        if (id) {
          await updateHeadOfficeExpenseEntry(id, entry);
          setHeadOfficeEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...entry } : e)));
        } else {
          const saved = await addHeadOfficeExpenseEntry(entry);
          setHeadOfficeEntries((prev) => [saved, ...prev]);
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

  const handleDeleteClassEntry = useCallback(async (id: string) => {
    try {
      await deleteClassIncomeEntry(id);
      setClassEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting class income:", err);
    }
  }, []);

  const handleReturnClassEntry = useCallback(async (id: string, returnedCustomers: number, returnedAmount: number) => {
    try {
      // Find the entry and validate limits before updating
      const target = classEntries.find((e) => e.id === id);
      if (target) {
        const remainingCustomers = target.customers - (target.returnedCustomers || 0);
        const remainingIncome = target.income - (target.returnedAmount || 0);
        if (returnedCustomers > remainingCustomers || returnedAmount > remainingIncome) {
          console.warn("Return exceeds remaining limits. Ignoring update.");
          return;
        }
      }
      await updateClassIncomeEntry(id, { returnedCustomers, returnedAmount });
      setClassEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                returnedCustomers: (e.returnedCustomers || 0) + returnedCustomers,
                returnedAmount: (e.returnedAmount || 0) + returnedAmount,
              }
            : e
        )
      );
    } catch (err) {
      console.error("Error updating class income return:", err);
    }
  }, [classEntries]);

  const handleEditIncomeEntry = useCallback((entry: IncomeEntry) => {
    setEditingIncomeEntry(entry);
    setShowIncomeModal(true);
  }, []);

  const handleDeleteIncome = useCallback(async (id: string) => {
    try {
      await deleteIncomeEntry(id);
      setIncomeEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting income:", err);
    }
  }, []);

  const handleEditClassEntry = useCallback((entry: ClassIncomeEntry) => {
    setEditingClassEntry(entry);
    setShowClassModal(true);
  }, []);

  const handleEditExtraEntry = useCallback((entry: ExtraExpenseEntry) => {
    setEditingExtraEntry(entry);
    setShowExtraModal(true);
  }, []);

  const handleDeleteExtraEntry = useCallback(async (id: string) => {
    try {
      await deleteExtraExpenseEntry(id);
      setExtraEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting extra expense:", err);
    }
  }, []);

  const handleEditHeadOfficeEntry = useCallback((entry: HeadOfficeExpenseEntry) => {
    setEditingHeadOfficeEntry(entry);
    setShowHeadOfficeModal(true);
  }, []);

  const handleDeleteHeadOfficeEntry = useCallback(async (id: string) => {
    try {
      await deleteHeadOfficeExpenseEntry(id);
      setHeadOfficeEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting head office expense:", err);
    }
  }, []);

  const branchIncome = useMemo(
    () => (branchFilter ? incomeEntries.filter((e) => e.branch === branchFilter) : incomeEntries),
    [incomeEntries, branchFilter]
  );
  const branchClass = useMemo(
    () => (branchFilter ? classEntries.filter((e) => e.branch === branchFilter) : classEntries),
    [classEntries, branchFilter]
  );
  const branchExtra = useMemo(
    () => (branchFilter ? extraEntries.filter((e) => e.branch === branchFilter) : extraEntries),
    [extraEntries, branchFilter]
  );

  const filteredIncome = useMemo(() => {
    if (!startDate && !endDate) return branchIncome;
    return branchIncome.filter((e) => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [branchIncome, startDate, endDate]);

  const filteredClass = useMemo(() => {
    if (!startDate && !endDate) return branchClass;
    return branchClass.filter((e) => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [branchClass, startDate, endDate]);

  const filteredExtra = useMemo(() => {
    if (!startDate && !endDate) return branchExtra;
    return branchExtra.filter((e) => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [branchExtra, startDate, endDate]);

  const filteredHeadOffice = useMemo(() => {
    if (!startDate && !endDate) return headOfficeEntries;
    return headOfficeEntries.filter((e) => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [headOfficeEntries, startDate, endDate]);

  // Calculate total head office expense for the filtered period
  const totalHeadOfficeExpense = useMemo(
    () => filteredHeadOffice.reduce((sum, e) => sum + e.amount, 0),
    [filteredHeadOffice]
  );

  const stats: BranchStatsMap = (branchFilter ? [branchFilter] : BRANCHES).reduce(
    (acc, b) => {
      const inc = filteredIncome
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.amount, 0);
      const clsInc = filteredClass
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + (e.income - (e.returnedAmount || 0)), 0);
      const extExp = filteredExtra
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.amount, 0);
      const procs = filteredClass
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.procedures, 0);
      const custs = filteredClass
        .filter((e) => e.branch === b)
        .reduce((s, e) => s + e.customers, 0);

      // Branch expense includes its own extra expenses.
      // On the overall dashboard, we also share head office expense evenly across all branches.
      // On a branch-specific dashboard, do not allocate the full head office expense to that single branch.
      const hoShare = branchFilter ? 0 : totalHeadOfficeExpense / BRANCHES.length;

      acc[b] = {
        income: inc + clsInc,
        expense: extExp + hoShare,
        procedures: procs,
        customers: custs,
      };
      return acc;
    },
    {} as BranchStatsMap
  );

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    setShowTrend(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#16324F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">
            {title || (branchFilter ? `${branchFilter} Dashboard` : "Branch Performance Dashboard")}
          </h1>
          <p className="text-xs text-slate-500 capitalize">
            {branchFilter ? `${branchFilter} - ` : ""}{period} Overview
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white border rounded-lg overflow-hidden border-slate-200">
            {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
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
              setEditingIncomeEntry(null);
              setShowIncomeModal(true);
            }}
            disabled={!canCreate}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              canCreate
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            + Income
          </button>
          <button
            onClick={() => {
              setEditingClassEntry(null);
              setShowClassModal(true);
            }}
            disabled={!canCreate}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              canCreate
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            + Class Income
          </button>
          <button
            onClick={() => {
              setEditingExtraEntry(null);
              setShowExtraModal(true);
            }}
            disabled={!canCreate}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              canCreate
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            + Extra Expense
          </button>
          <button
            onClick={() => {
              setEditingHeadOfficeEntry(null);
              setShowHeadOfficeModal(true);
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

      <KPISection stats={stats} />
      <ChartsSection stats={stats} />

      {!branchFilter && <BranchTable stats={stats} />}

      {showTrend && (
        <BranchTrendGraph
          period={period}
          incomeEntries={filteredIncome}
          classEntries={filteredClass}
          extraEntries={filteredExtra}
          branchFilter={branchFilter}
        />
      )}

      {/* Class Procedure Comparison - shows per-class procedure comparison across branches */}
      {!branchFilter && <ClassProcedureComparison classEntries={filteredClass} />}

      {/* Branch Procedure Pie Chart - shows class distribution for a specific branch */}
      {branchFilter && <BranchProcedurePieChart branch={branchFilter} classEntries={filteredClass} />}

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-800">Class-wise Income</h2>
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
                      Income: e.income,
                      "Returned Customers": e.returnedCustomers || 0,
                      "Returned Amount": e.returnedAmount || 0,
                      "Net Income": e.income - (e.returnedAmount || 0),
                    })),
                    "class-income"
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
            onReturn={handleReturnClassEntry}
            onEdit={handleEditClassEntry}
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
          <ExtraExpenseTable entries={filteredExtra} onDelete={handleDeleteExtraEntry} onEdit={handleEditExtraEntry} />
        </div>
      </div>

      <AlertsList stats={stats} />

      {filteredIncome.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Income Entries</h2>
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
                    <td className="p-3 font-medium text-green-600">${entry.amount.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Authorized permission="edit" fallback={null}>
                          <button
                            onClick={() => handleEditIncomeEntry(entry)}
                            className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                          >
                            Edit
                          </button>
                        </Authorized>
                        <Authorized permission="delete" fallback={null}>
                          <button
                            onClick={() => handleDeleteIncome(entry.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </Authorized>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Head Office Section */}
      {!branchFilter && (
        <div className="mt-6 border-t-2 border-dashed border-gray-300 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏢</span>
            <h2 className="text-xl font-bold text-[#16324F]">Head Office</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-gray-800">Head Office Expenses</h2>
                {filteredHeadOffice.length > 0 && (
                  <button
                    onClick={() =>
                      exportToXLSX(
                        filteredHeadOffice.map((e) => ({
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
                entries={filteredHeadOffice}
                onDelete={handleDeleteHeadOfficeEntry}
                onEdit={handleEditHeadOfficeEntry}
              />
            </div>
            <div>
              <HeadOfficeExpenseGraph period={period} entries={filteredHeadOffice} />
            </div>
          </div>
        </div>
      )}

<AddIncomeModal
        isOpen={showIncomeModal}
        onClose={() => {
          setShowIncomeModal(false);
          setEditingIncomeEntry(null);
        }}
        onSave={handleSaveIncome}
        initialEntry={editingIncomeEntry}
        fixedBranch={branchFilter}
      />
      <AddClassIncomeModal
        isOpen={showClassModal}
        onClose={() => {
          setShowClassModal(false);
          setEditingClassEntry(null);
        }}
        onSave={handleSaveClassIncome}
        initialEntry={editingClassEntry}
        fixedBranch={branchFilter}
      />
      <AddExtraExpenseModal
        isOpen={showExtraModal}
        onClose={() => {
          setShowExtraModal(false);
          setEditingExtraEntry(null);
        }}
        onSave={handleSaveExtraExpense}
        categories={categories}
        initialEntry={editingExtraEntry}
        fixedBranch={branchFilter}
      />
      <AddHeadOfficeExpenseModal
        isOpen={showHeadOfficeModal}
        onClose={() => {
          setShowHeadOfficeModal(false);
          setEditingHeadOfficeEntry(null);
        }}
        onSave={handleSaveHeadOfficeExpense}
        categories={categories}
        initialEntry={editingHeadOfficeEntry}
      />
    </>
  );
}
