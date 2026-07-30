import { Branch, BranchSlug } from "@/types";

export const BRANCHES: Branch[] = ["Branch 1", "Branch 2", "Branch 3", "Branch 4"];

export const BRANCH_COLORS: Record<Branch, string> = {
  "Branch 1": "#16324F",
  "Branch 2": "#1FA2A6",
  "Branch 3": "#E8A33D",
  "Branch 4": "#E15554",
};

// Mapping from Branch to URL slug
export const BRANCH_SLUG_MAP: Record<Branch, BranchSlug> = {
  "Branch 1": "branch-1",
  "Branch 2": "branch-2",
  "Branch 3": "branch-3",
  "Branch 4": "branch-4",
};

// Inverse mapping from slug to Branch
export const SLUG_TO_BRANCH_MAP: Record<BranchSlug, Branch> = {
  "branch-1": "Branch 1",
  "branch-2": "Branch 2",
  "branch-3": "Branch 3",
  "branch-4": "Branch 4",
};

// Sidebar navigation items
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "Branch 1", href: "/branch/branch-1", icon: "🏢" },
  { label: "Branch 2", href: "/branch/branch-2", icon: "🏢" },
  { label: "Branch 3", href: "/branch/branch-3", icon: "🏢" },
  { label: "Branch 4", href: "/branch/branch-4", icon: "🏢" },
];

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
  CLASSWISE_INCOME: "branch_dashboard_classwise_income",
  EXTRA_EXPENSE: "branch_dashboard_extra_expense",
  CATEGORIES: "branch_dashboard_expense_categories",
};

