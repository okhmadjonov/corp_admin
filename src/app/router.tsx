import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import LoginPage from "@/pages/LoginPage/LoginPage";
import DashboardPage from "@/pages/DashboardPage/DashboardPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/", element: <DashboardPage /> }],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
