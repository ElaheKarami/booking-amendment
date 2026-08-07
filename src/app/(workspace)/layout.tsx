import { type ReactNode } from "react";
import { AuthenticationBoundary } from "@/components/organisms";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { AuthProvider } from "@/providers";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default async function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return <AuthenticationBoundary />;
  }

  return <AuthProvider user={user}>{children}</AuthProvider>;
}
