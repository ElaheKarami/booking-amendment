import { PERMISSION_ROLES } from "@/constants/Permissions";

export function hasRole(
  user: CurrentUser | null | undefined,
  role: UserRole,
): boolean {
  return Boolean(user?.roles.includes(role));
}

export function hasPermission(
  user: CurrentUser | null | undefined,
  permission: Permission,
): boolean {
  if (!user) {
    return false;
  }

  const requiredRoles = PERMISSION_ROLES[permission];
  return requiredRoles.some((role) => user.roles.includes(role));
}
