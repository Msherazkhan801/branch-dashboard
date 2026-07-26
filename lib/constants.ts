import { Branch } from "@/types";

export const BRANCHES: Branch[] = ["Branch 1", "Branch 2", "Branch 3", "Branch 4"];

export const BRANCH_COLORS: Record<Branch, string> = {
  "Branch 1": "#16324F",
  "Branch 2": "#1FA2A6",
  "Branch 3": "#E8A33D",
  "Branch 4": "#E15554",
};

export const CLASSES = [
  "Botox Procedure",
  "CO2 Laser",
  "Exosome Procedure",
  "Face PRP/Micro",
  "Filler Procedure",
  "Hair PRP/PRGF/Meso",
  "Hair Removal Laser",
  "Hair Transplant",
  "Hydra Procedure",
  "Medicine",
  "ICO Laser",
  "Whitening Inj Procedure",
  "Other",
];

export const DEFAULT_CATEGORIES = ["Rent", "Salary", "Other Expenses"];

export const STORAGE_KEYS = {
  INCOME: "branch_dashboard_income",
  CLASSWISE_EXPENSE: "branch_dashboard_classwise_expense",
  EXTRA_EXPENSE: "branch_dashboard_extra_expense",
  CATEGORIES: "branch_dashboard_expense_categories",
};

