"use client";

import { ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Permission } from "@/lib/auth";

interface AuthorizedProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

export default function Authorized({ permission, fallback = null, children }: AuthorizedProps) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
