import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { IncomeEntry, ClassIncomeEntry, ExtraExpenseEntry } from "@/types";
import { DEFAULT_CATEGORIES } from "./constants";

// ---------- Collections ----------
const INCOME_COLLECTION = "income";
const CLASS_INCOME_COLLECTION = "classwiseIncome";
const EXTRA_EXPENSE_COLLECTION = "extraExpense";
const CATEGORIES_DOC = "categories";
const CATEGORIES_COLLECTION = "appConfig";

// ---------- Helper to convert Firestore timestamps ----------
function toDateString(timestamp: Timestamp | null): string {
  if (!timestamp) return new Date().toISOString().split("T")[0];
  return timestamp.toDate().toISOString().split("T")[0];
}

// ===================== INCOME =====================

export async function fetchIncomeEntries(): Promise<IncomeEntry[]> {
  const q = query(collection(db, INCOME_COLLECTION), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    branch: d.data().branch,
    date: toDateString(d.data().date),
    amount: d.data().amount,
  })) as IncomeEntry[];
}

export async function addIncomeEntry(entry: Omit<IncomeEntry, "id">): Promise<IncomeEntry> {
  const docRef = await addDoc(collection(db, INCOME_COLLECTION), {
    branch: entry.branch,
    date: Timestamp.fromDate(new Date(entry.date)),
    amount: entry.amount,
  });
  return { ...entry, id: docRef.id };
}

export async function deleteIncomeEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, INCOME_COLLECTION, id));
}

// ===================== CLASS INCOME =====================

export async function fetchClassIncomeEntries(): Promise<ClassIncomeEntry[]> {
  const q = query(collection(db, CLASS_INCOME_COLLECTION), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    branch: d.data().branch,
    date: toDateString(d.data().date),
    procClass: d.data().procClass,
    procedures: d.data().procedures,
    customers: d.data().customers,
    income: d.data().income,
  })) as ClassIncomeEntry[];
}

export async function addClassIncomeEntry(entry: Omit<ClassIncomeEntry, "id">): Promise<ClassIncomeEntry> {
  const docRef = await addDoc(collection(db, CLASS_INCOME_COLLECTION), {
    branch: entry.branch,
    date: Timestamp.fromDate(new Date(entry.date)),
    procClass: entry.procClass,
    procedures: entry.procedures,
    customers: entry.customers,
    income: entry.income,
  });
  return { ...entry, id: docRef.id };
}

export async function deleteClassIncomeEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, CLASS_INCOME_COLLECTION, id));
}

// ===================== EXTRA EXPENSE =====================

export async function fetchExtraExpenseEntries(): Promise<ExtraExpenseEntry[]> {
  const q = query(collection(db, EXTRA_EXPENSE_COLLECTION), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    branch: d.data().branch,
    date: toDateString(d.data().date),
    category: d.data().category,
    amount: d.data().amount,
  })) as ExtraExpenseEntry[];
}

export async function addExtraExpenseEntry(entry: Omit<ExtraExpenseEntry, "id">): Promise<ExtraExpenseEntry> {
  const docRef = await addDoc(collection(db, EXTRA_EXPENSE_COLLECTION), {
    branch: entry.branch,
    date: Timestamp.fromDate(new Date(entry.date)),
    category: entry.category,
    amount: entry.amount,
  });
  return { ...entry, id: docRef.id };
}

export async function deleteExtraExpenseEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, EXTRA_EXPENSE_COLLECTION, id));
}

// ===================== CATEGORIES =====================

export async function fetchCategories(): Promise<string[]> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, CATEGORIES_DOC);
    const snapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const catDoc = snapshot.docs.find((d) => d.id === CATEGORIES_DOC);
    if (catDoc?.data().list) {
      return catDoc.data().list as string[];
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_CATEGORIES;
}

export async function saveCategories(categories: string[]): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, CATEGORIES_DOC);
  const { setDoc } = await import("firebase/firestore");
  await setDoc(docRef, { list: categories });
}
