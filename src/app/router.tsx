import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout/AdminLayout";
import LoginPage from "@/pages/LoginPage/LoginPage";
import DashboardPage from "@/pages/DashboardPage/DashboardPage";
import CategoriesPage from "@/pages/CategoriesPage/CategoriesPage";
import ClothesListPage from "@/pages/ClothesListPage/ClothesListPage";
import ClothesFormPage from "@/pages/ClothesFormPage/ClothesFormPage";
import PatternsListPage from "@/pages/PatternsListPage/PatternsListPage";
import PatternFormPage from "@/pages/PatternFormPage/PatternFormPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/categories", element: <CategoriesPage /> },
          { path: "/categories", element: <CategoriesPage /> },
          { path: "/clothes", element: <ClothesListPage /> },
          { path: "/clothes/new", element: <ClothesFormPage /> },
          { path: "/clothes/:id", element: <ClothesFormPage /> },
          { path: "/patterns", element: <PatternsListPage /> },
          { path: "/patterns/new", element: <PatternFormPage /> },
          { path: "/patterns/:id", element: <PatternFormPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
