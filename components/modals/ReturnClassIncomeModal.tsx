"use client";

import { useState } from "react";
import { ClassIncomeEntry } from "@/types";

interface ReturnClassIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturn: (id: string, returnedCustomers: number, returnedAmount: number) => void;
  entry: ClassIncomeEntry | null;
}

export default function ReturnClassIncomeModal({ isOpen, onClose, onReturn, entry }: ReturnClassIncomeModalProps) {
  const [returnedCustomers, setReturnedCustomers] = useState("");
  const [returnedAmount, setReturnedAmount] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !entry) return null;

  // Remaining limits (after already-returned amounts)
  const remainingCustomers = entry.customers - (entry.returnedCustomers || 0);
  const remainingIncome = entry.income - (entry.returnedAmount || 0);

  const cust = Number(returnedCustomers || 0);
  const amt = Number(returnedAmount || 0);

  // Validation flags
  const customersExceeded = cust > remainingCustomers;
  const amountExceeded = amt > remainingIncome;
  const invalid = cust <= 0 || amt <= 0 || customersExceeded || amountExceeded;

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReturnedCustomers(val);
    setError("");
    const num = Number(val);
    if (num > remainingCustomers) {
      setError(`Maximum returned customers is ${remainingCustomers}. You can only return up to ${remainingCustomers} customer${remainingCustomers === 1 ? "" : "s"}.`);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReturnedAmount(val);
    setError("");
    const num = Number(val);
    if (num > remainingIncome) {
      setError(`Maximum refund amount is $${remainingIncome.toLocaleString()}.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) {
      if (customersExceeded) {
        setError(`Maximum returned customers is ${remainingCustomers}. You can only return up to ${remainingCustomers} customer${remainingCustomers === 1 ? "" : "s"}.`);
      } else if (amountExceeded) {
        setError(`Maximum refund amount is $${remainingIncome.toLocaleString()}.`);
      } else {
        setError("Please enter a valid returned customers count and refund amount greater than 0.");
      }
      return;
    }

    onReturn(entry.id, cust, amt);

    setReturnedCustomers("");
    setReturnedAmount("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setReturnedCustomers("");
    setReturnedAmount("");
    setError("");
    onClose();
  };

  // Calculate what the net would be after return
  const netIncome = entry.income - (entry.returnedAmount + Number(returnedAmount || 0));
  const netCustomers = entry.customers - (entry.returnedCustomers + Number(returnedCustomers || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Return / Refund</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            &times;
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
          <p><span className="font-medium text-gray-600">Branch:</span> {entry.branch}</p>
          <p><span className="font-medium text-gray-600">Class:</span> {entry.procClass}</p>
          <p><span className="font-medium text-gray-600">Date:</span> {entry.date}</p>
          <p><span className="font-medium text-gray-600">Original Income:</span> ${entry.income.toLocaleString()}</p>
          <p><span className="font-medium text-gray-600">Original Customers:</span> {entry.customers}</p>
          {entry.returnedAmount > 0 && (
            <>
              <p><span className="font-medium text-red-600">Already Returned:</span> ${entry.returnedAmount.toLocaleString()} ({entry.returnedCustomers} customers)</p>
              <p><span className="font-medium text-gray-600">Current Net Income:</span> <span className="text-green-600 font-medium">${(entry.income - entry.returnedAmount).toLocaleString()}</span></p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Returned Customers
              </label>
              <input
                type="number"
                min="0"
                max={remainingCustomers}
                value={returnedCustomers}
                onChange={handleCustomerChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F] ${
                  customersExceeded ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder={`Max ${remainingCustomers}`}
                required
              />
              {customersExceeded && (
                <p className="text-xs text-red-600 mt-1">
                  Max: {remainingCustomers} customer{remainingCustomers === 1 ? "" : "s"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Amount ($)
              </label>
              <input
                type="number"
                min="0"
                max={remainingIncome}
                step="0.01"
                value={returnedAmount}
                onChange={handleAmountChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F] ${
                  amountExceeded ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder={`Max $${remainingIncome.toLocaleString()}`}
                required
              />
              {amountExceeded && (
                <p className="text-xs text-red-600 mt-1">
                  Max: ${remainingIncome.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          {!error && returnedCustomers && returnedAmount && Number(returnedCustomers) > 0 && Number(returnedAmount) > 0 && !customersExceeded && !amountExceeded && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-medium text-blue-800">After Return Preview:</p>
              <p className="text-blue-700">Net Income: <span className="font-bold">${netIncome.toLocaleString()}</span></p>
              <p className="text-blue-700">Net Customers: <span className="font-bold">{netCustomers}</span></p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={invalid}
              className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                invalid
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              Confirm Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
