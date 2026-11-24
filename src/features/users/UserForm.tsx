import { useState, type FormEvent } from "react";
import { Button } from "@/components/Button/Button";
import type { RoleName } from "@/types/auth";
import type { AdminUser, UserCreate, UserUpdate } from "@/types/users";
import { ROLE_LABELS, ROLE_NAMES } from "@/utils/roles";
import styles from "@/features/clothes/Sections.module.scss";

interface Props {
  initial?: AdminUser;
  lockRole?: boolean;
  submitting: boolean;
  error: string;
  onCreate: (data: UserCreate) => void;
  onUpdate: (data: UserUpdate) => void;
  onCancel: () => void;
}

export function UserForm({
  initial,
  lockRole,
  submitting,
  error,
  onCreate,
  onUpdate,
  onCancel,
}: Props) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [role, setRole] = useState<RoleName>(initial?.role.name ?? "operator");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (initial) {
      onUpdate({ full_name: fullName.trim(), role });
    } else {
      onCreate({
        login: login.trim(),
        password,
        full_name: fullName.trim(),
        role,
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {initial ? (
        <div className={styles.hint}>
          Login: <strong>{initial.login}</strong> (o'zgartirib bo'lmaydi)
        </div>
      ) : (
        <div className={styles.row}>
          <label className={styles.field}>
            <span>Login *</span>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              minLength={3}
              maxLength={100}
              autoComplete="off"
              required
              autoFocus
            />
          </label>
          <label className={styles.field}>
            <span>Parol *</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              maxLength={72}
              autoComplete="new-password"
              required
            />
          </label>
        </div>
      )}

      <label className={styles.field}>
        <span>To'liq ismi *</span>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          minLength={2}
          maxLength={150}
          required
        />
      </label>

      <label className={styles.field}>
        <span>Rol *</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as RoleName)}
          disabled={lockRole}
        >
          {ROLE_NAMES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </label>
      {lockRole && (
        <div className={styles.hint}>O'z rolingizni o'zgartira olmaysiz.</div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={submitting}>
          Saqlash
        </Button>
      </div>
    </form>
  );
}
