import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { refreshAccessToken } from "@/api/client";
import { session } from "@/api/session";
import type { RoleName, User } from "@/types/auth";
import { AuthContext } from "./AuthContext";

const ADMIN_ROLES: RoleName[] = ["super_admin", "operator"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  // cookie bor-yo'qligini JS bilmaydi, shuning uchun har ochilishda tekshiramiz
  const [loading, setLoading] = useState(true);

  const endSession = useCallback(() => {
    session.set(null);
    qc.clear(); // keyingi foydalanuvchi eski ma'lumotni ko'rmasin
    setUser(null);
  }, [qc]);

  // sahifa ochilganda: httpOnly cookie orqali access token olib, foydalanuvchini tiklaydi
  useEffect(() => {
    let cancelled = false;

    refreshAccessToken()
      .then(() => authApi.me())
      .then(async (me) => {
        if (cancelled) return;
        if (ADMIN_ROLES.includes(me.role.name)) setUser(me);
        else await authApi.logout().catch(() => undefined); // rol o'zgargan
      })
      .catch(() => session.set(null)) // cookie yo'q yoki eskirgan — login sahifasi
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // sessiya (refresh cookie) tugasa, axios klienti shu hodisani yuboradi
  useEffect(() => {
    window.addEventListener("auth:expired", endSession);
    return () => window.removeEventListener("auth:expired", endSession);
  }, [endSession]);

  const login = useCallback(async (loginName: string, password: string) => {
    // oddiy foydalanuvchini backend o'zi 403 bilan qaytaradi (X-App: admin)
    const tokens = await authApi.login(loginName, password);
    session.set(tokens.access_token);
    const me = await authApi.me();
    if (!ADMIN_ROLES.includes(me.role.name)) {
      await authApi.logout().catch(() => undefined);
      session.set(null);
      throw new Error("FORBIDDEN_ROLE");
    }
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined);
    endSession();
  }, [endSession]);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
