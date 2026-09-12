import { Navigate, Outlet } from "react-router-dom";

import AppLoader from "@/components/common/AppLoader/AppLoader";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth/useAuthStore";

export default function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return <AppLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
