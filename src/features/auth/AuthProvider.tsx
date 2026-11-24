import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { tokenStorage } from "@/utils/tokenStorage";
import type { RoleName, User } from "@/types/auth";
import { AuthContext } from "./AuthContext";

const ADMIN_ROLES: RoleName[] = ["super_admin", "operator"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() =>
    Boolean(tokenStorage.getAccess()),
  );

  // sahifa yangilanganda token bo'yicha foydalanuvchini tiklaydi
  useEffect(() => {
    if (!tokenStorage.getAccess()) return;
    let cancelled = false;

    authApi
      .me()
      .then((me) => {
        if (cancelled) return;
        if (ADMIN_ROLES.includes(me.role.name)) setUser(me);
        else tokenStorage.clear();
      })
      .catch(() => tokenStorage.clear())
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (loginName: string, password: string) => {
    const tokens = await authApi.login(loginName, password);
    tokenStorage.set(tokens.access_token, tokens.refresh_token);
    const me = await authApi.me();
    if (!ADMIN_ROLES.includes(me.role.name)) {
      await authApi.logout(tokens.refresh_token).catch(() => undefined);
      tokenStorage.clear();
      throw new Error("FORBIDDEN_ROLE");
    }
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh();
    if (refresh) await authApi.logout(refresh).catch(() => undefined);
    tokenStorage.clear();
    qc.clear(); // keyingi foydalanuvchi eski ma'lumotni ko'rmasin
    setUser(null);
  }, [qc]);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
