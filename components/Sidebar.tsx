"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-[#16324F] text-white transition-all duration-300 flex flex-col ${
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 w-64"
        }`}
      >
        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-4 bg-[#16324F] text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-white/20 text-sm hover:bg-[#1f4270] transition-colors z-10"
        >
          {collapsed ? "›" : "‹"}
        </button>

        {/* Logo / Header */}
        <div className={`p-4 border-b border-white/10 ${collapsed ? "text-center" : ""}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">📈</span>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-sm font-bold truncate">Branch Dashboard</h2>
                <p className="text-[10px] text-white/60 truncate">Performance Analytics</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className={`p-3 border-t border-white/10 text-[10px] text-white/40 ${collapsed ? "text-center" : ""}`}>
          {!collapsed && <p>© 2024 Branch Analytics</p>}
        </div>
      </aside>

      {/* Mobile toggle button (when sidebar is collapsed on mobile) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed top-3 left-3 z-30 bg-[#16324F] text-white w-9 h-9 rounded-lg flex items-center justify-center shadow-md lg:hidden hover:bg-[#1f4270] transition-colors"
        >
          ☰
        </button>
      )}
    </>
  );
}

