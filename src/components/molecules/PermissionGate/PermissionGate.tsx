"use client";

import { type ReactNode } from "react";
import EmptyState from "../EmptyState/EmptyState";
import { useAuth } from "@/providers";

export interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * UI-level permission gate for user experience only.
 * The API must independently enforce authorisation.
 */
function PermissionGate({
  permission,
  children,
  fallback,
}: PermissionGateProps) {
  const { hasPermission } = useAuth();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  return (
    <EmptyState
      title="Permission required"
      description="You do not have permission to perform this action. API authorisation is enforced independently on the back end."
    />
  );
}

PermissionGate.displayName = "PermissionGate";

export default PermissionGate;
