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
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { IncomeEntry, ClassIncomeEntry, ExtraExpenseEntry, HeadOfficeExpenseEntry } from "@/types";
import { DEFAULT_CATEGORIES } from "./constants";

// ---------- Collections ----------
const INCOME_COLLECTION = "income";
const CLASS_INCOME_COLLECTION = "classwiseIncome";
const EXTRA_EXPENSE_COLLECTION = "extraExpense";
const HEAD_OFFICE_EXPENSE_COLLECTION = "headOfficeExpense";
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

export async function updateIncomeEntry(id: string, data: Partial<IncomeEntry>): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (data.branch !== undefined) updateData.branch = data.branch;
  if (data.date !== undefined) updateData.date = Timestamp.fromDate(new Date(data.date));
  if (data.amount !== undefined) updateData.amount = data.amount;
  await updateDoc(doc(db, INCOME_COLLECTION, id), updateData);
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
    returnedCustomers: d.data().returnedCustomers ?? 0,
    returnedAmount: d.data().returnedAmount ?? 0,
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
    returnedCustomers: entry.returnedCustomers ?? 0,
    returnedAmount: entry.returnedAmount ?? 0,
  });
  return { ...entry, id: docRef.id, returnedCustomers: entry.returnedCustomers ?? 0, returnedAmount: entry.returnedAmount ?? 0 };
}

export async function deleteClassIncomeEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, CLASS_INCOME_COLLECTION, id));
}

export async function updateClassIncomeEntry(id: string, data: Partial<ClassIncomeEntry>): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (data.branch !== undefined) updateData.branch = data.branch;
  if (data.date !== undefined) updateData.date = Timestamp.fromDate(new Date(data.date));
  if (data.procClass !== undefined) updateData.procClass = data.procClass;
  if (data.procedures !== undefined) updateData.procedures = data.procedures;
  if (data.customers !== undefined) updateData.customers = data.customers;
  if (data.income !== undefined) updateData.income = data.income;
  if (data.returnedCustomers !== undefined) updateData.returnedCustomers = data.returnedCustomers;
  if (data.returnedAmount !== undefined) updateData.returnedAmount = data.returnedAmount;
  await updateDoc(doc(db, CLASS_INCOME_COLLECTION, id), updateData);
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

export async function updateExtraExpenseEntry(id: string, data: Partial<ExtraExpenseEntry>): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (data.branch !== undefined) updateData.branch = data.branch;
  if (data.date !== undefined) updateData.date = Timestamp.fromDate(new Date(data.date));
  if (data.category !== undefined) updateData.category = data.category;
  if (data.amount !== undefined) updateData.amount = data.amount;
  await updateDoc(doc(db, EXTRA_EXPENSE_COLLECTION, id), updateData);
}

// ===================== HEAD OFFICE EXPENSE =====================

export async function fetchHeadOfficeExpenseEntries(): Promise<HeadOfficeExpenseEntry[]> {
  const q = query(collection(db, HEAD_OFFICE_EXPENSE_COLLECTION), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    date: toDateString(d.data().date),
    category: d.data().category,
    amount: d.data().amount,
  })) as HeadOfficeExpenseEntry[];
}

export async function addHeadOfficeExpenseEntry(entry: Omit<HeadOfficeExpenseEntry, "id">): Promise<HeadOfficeExpenseEntry> {
  const docRef = await addDoc(collection(db, HEAD_OFFICE_EXPENSE_COLLECTION), {
    date: Timestamp.fromDate(new Date(entry.date)),
    category: entry.category,
    amount: entry.amount,
  });
  return { ...entry, id: docRef.id };
}

export async function updateHeadOfficeExpenseEntry(id: string, data: Partial<HeadOfficeExpenseEntry>): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (data.date !== undefined) updateData.date = Timestamp.fromDate(new Date(data.date));
  if (data.category !== undefined) updateData.category = data.category;
  if (data.amount !== undefined) updateData.amount = data.amount;
  await updateDoc(doc(db, HEAD_OFFICE_EXPENSE_COLLECTION, id), updateData);
}

export async function deleteHeadOfficeExpenseEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, HEAD_OFFICE_EXPENSE_COLLECTION, id));
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
