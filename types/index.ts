export type Branch = "Branch 1" | "Branch 2" | "Branch 3" | "Branch 4";
export type Period = "daily" | "weekly" | "monthly" | "yearly";

export interface IncomeEntry {
  id: number;
  branch: Branch;
  date: string;
  amount: number;
}

export interface ClassExpenseEntry {
  id: number;
  branch: Branch;
  date: string;
  procClass: string;
  procedures: number;
  customers: number;
  expense: number;
}

export interface ExtraExpenseEntry {
  id: number;
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

