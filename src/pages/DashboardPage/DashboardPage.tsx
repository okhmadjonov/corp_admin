import { useAuth } from "@/features/auth/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Salom, {user?.full_name}</h1>
      <p>Rol: {user?.role.name}</p>
      <button onClick={logout}>Chiqish</button>
    </div>
  );
}
