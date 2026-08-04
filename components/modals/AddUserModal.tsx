"use client";

import { useState } from "react";
import { FirestoreUser } from "@/lib/firestoreService";

const ROLE_OPTIONS = [
  { value: "data-entry", label: "Data Entry" },
  { value: "manager", label: "Manager" },
] as const;

type NewUserRole = "data-entry" | "manager";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: {
    name: string;
    email: string;
    password: string;
    role: NewUserRole;
  }, id?: string) => void;
  initialUser?: FirestoreUser | null;
}

export default function AddUserModal({ isOpen, onClose, onSave, initialUser = null }: AddUserModalProps) {
  // Initialize state directly from props. The parent mounts this modal with a
  // unique `key` (e.g. `key={editingUser?.id ?? "new"}`) so it remounts fresh
  // whenever switching between Add and Edit modes.
  const [name, setName] = useState(initialUser?.name ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<NewUserRole>(
    initialUser?.role === "manager" ? "manager" : "data-entry"
  );
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!initialUser && !password.trim()) {
      setError("Password is required for new users.");
      return;
    }

    onSave(
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
      },
      initialUser?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialUser ? "Edit User" : "Add User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
              placeholder="e.g. user@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password{" "}
              {initialUser && (
                <span className="text-gray-400 font-normal">
                  (leave blank to keep current)
                </span>
              )}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
              placeholder={initialUser ? "Enter new password..." : "Enter password"}
              required={!initialUser}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as NewUserRole)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Managers have full access; Data Entry users cannot delete records.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-[#16324F] rounded-lg hover:bg-[#0f2439]"
            >
              {initialUser ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

