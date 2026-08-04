"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import RequireAuth from "@/components/RequireAuth";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <RequireAuth>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-16 transition-all duration-300 p-4 md:p-6 overflow-x-hidden">
          <div className="flex justify-end mb-4">
            {user && (
              <button
                onClick={logout}
                className="rounded-full bg-red-600 text-white px-3 py-1 text-xs font-semibold hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>
          {children}
        </main>
      </div>
    </RequireAuth>
  );
}
