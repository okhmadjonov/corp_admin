import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FullPageLoader } from "@/components/FullPageLoader/FullPageLoader";
import type { RoleName } from "@/types/auth";
import { useAuth } from "./useAuth";

export function ProtectedRoute({ roles }: { roles?: RoleName[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role.name))
    return <Navigate to="/" replace />;

  return <Outlet />;
}
