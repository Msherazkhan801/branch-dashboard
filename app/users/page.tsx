"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  fetchUsers,
  createUser,
  updateUserInDB,
  deleteUserFromDB,
  FirestoreUser,
} from "@/lib/firestoreService";
import Authorized from "@/components/Authorized";
import AddUserModal from "@/components/modals/AddUserModal";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  "data-entry": "Data Entry",
  viewer: "Viewer",
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  manager: "bg-blue-100 text-blue-700",
  "data-entry": "bg-amber-100 text-amber-700",
  viewer: "bg-gray-100 text-gray-600",
};

export default function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<FirestoreUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchUsers();
        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        if (!cancelled) {
          setError("Failed to load users.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const handleSave = useCallback(
    async (
      userData: {
        name: string;
        email: string;
        password: string;
        role: "data-entry" | "manager";
      },
      id?: string
    ) => {
      setError("");
      try {
        if (id) {
          await updateUserInDB(id, userData);
          setUsers((prev) =>
            prev.map((u) =>
              u.id === id
                ? {
                    ...u,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    ...(userData.password ? { password: userData.password } : {}),
                  }
                : u
            )
          );
        } else {
          const created = await createUser(userData);
          setUsers((prev) => [...prev, created]);
        }
        setShowModal(false);
        setEditingUser(null);
      } catch (err) {
        console.error("Error saving user:", err);
        setError(
          id
            ? "Failed to update user. Please try again."
            : "Failed to create user. Please try again."
        );
      }
    },
    []
  );

  const handleDelete = useCallback(async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setError("");
    try {
      await deleteUserFromDB(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user. Please try again.");
    }
  }, []);

  // Non-admin users should not access this page
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Access Denied</h1>
          <p className="text-sm text-gray-500">
            Only administrators can manage users.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#16324F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">User Management</h1>
          <p className="text-xs text-slate-500">
            Create and manage users &amp; managers
          </p>
        </div>
        <Authorized permission="create" fallback={null}>
          <button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
          >
            + Add User
          </button>
        </Authorized>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Users</h2>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Total: {users.length}
          </span>
        </div>

        {users.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-400">{`No users yet. Click "+ Add User" to create one.`}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{u.name}</td>
                    <td className="p-3 text-gray-600">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          ROLE_BADGE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Authorized permission="edit" fallback={null}>
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setShowModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                          >
                            Edit
                          </button>
                        </Authorized>
                        {u.role !== "admin" && (
                          <Authorized permission="delete" fallback={null}>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </Authorized>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddUserModal
        key={editingUser?.id ?? "new"}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        onSave={handleSave}
        initialUser={editingUser}
      />
    </>
  );
}
