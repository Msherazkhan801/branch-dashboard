export type Branch = "Branch 1" | "Branch 2" | "Branch 3" | "Branch 4";
export type BranchSlug = "branch-1" | "branch-2" | "branch-3" | "branch-4";
export type Period = "daily" | "weekly" | "monthly" | "yearly";

export interface IncomeEntry {
  id: string;
  branch: Branch;
  date: string;
  amount: number;
}

export interface ClassIncomeEntry {
  id: string;
  branch: Branch;
  date: string;
  procClass: string;
  procedures: number;
  customers: number;
  income: number;
}

export interface ExtraExpenseEntry {
  id: string;
  branch: Branch;
  date: string;
  category: string;
  amount: number;
}

export interface BranchStats {
  income: number;
  expense: number;
  procedures: number;
  customers: number;
}

export type BranchStatsMap = Record<Branch, BranchStats>;

export interface TrendDataPoint {
  label: string;
  income: number;
  expense: number;
  procedures: number;
  customers: number;
}
