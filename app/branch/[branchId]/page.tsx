"use client";

import { useParams } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import { SLUG_TO_BRANCH_MAP } from "@/lib/constants";
import { BranchSlug } from "@/types";

export default function BranchPage() {
  const params = useParams();
  const branchId = params.branchId as BranchSlug;

  // Map slug to branch name
  const branch = SLUG_TO_BRANCH_MAP[branchId];

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Branch Not Found</h1>
          <p className="text-slate-500 text-sm">The branch you&apos;re looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return <DashboardContent branchFilter={branch} title={`${branch} Dashboard`} />;
}

