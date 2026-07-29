import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Branch Performance Dashboard",
  description: "Multi-branch performance tracking and analytics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-800">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-16 transition-all duration-300 p-4 md:p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
