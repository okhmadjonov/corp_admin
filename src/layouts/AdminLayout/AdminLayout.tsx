import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/Button/Button";
import { useAuth } from "@/features/auth/useAuth";
import type { RoleName } from "@/types/auth";
import styles from "./AdminLayout.module.scss";
import { ROLE_LABELS } from "@/utils/roles";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  roles?: RoleName[];
}

const NAV: NavItem[] = [
  { to: "/", label: "Bosh sahifa", end: true },
  { to: "/categories", label: "Kategoriyalar" },
  { to: "/clothes", label: "Kiyimlar" },
  { to: "/patterns", label: "Patternlar" },
  { to: "/users", label: "Foydalanuvchilar", roles: ["super_admin"] },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const items = NAV.filter(
    (i) => !i.roles || (user && i.roles.includes(user.role.name)),
  );

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Corp Admin</div>
        <nav className={styles.nav}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.user}>
            <strong>{user?.full_name}</strong>
            <span>{user ? ROLE_LABELS[user.role.name] : ""}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={logout}>
            Chiqish
          </Button>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
