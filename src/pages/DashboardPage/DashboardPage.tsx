import { useAuth } from "@/features/auth/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  return <h1>Salom, {user?.full_name}</h1>;
}
