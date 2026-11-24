import { useState, type FormEvent } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Button } from "@/components/Button/Button";
import { Modal } from "@/components/Modal/Modal";
import { Pagination } from "@/components/Pagination/Pagination";
import { Table, type Column } from "@/components/Table/Table";
import { usersApi } from "@/api/users";
import { useAuth } from "@/features/auth/useAuth";
import { UserForm } from "@/features/users/UserForm";
import type { RoleName } from "@/types/auth";
import type { AdminUser } from "@/types/users";
import { getErrorMessage } from "@/utils/errors";
import { formatDate } from "@/utils/format";
import { ROLE_LABELS, ROLE_NAMES } from "@/utils/roles";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import formStyles from "@/features/clothes/Sections.module.scss";
import styles from "./UsersPage.module.scss";

const PAGE_SIZE = 20;

function ResetPasswordForm({
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  submitting: boolean;
  error: string;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <label className={formStyles.field}>
        <span>Yangi parol *</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          maxLength={72}
          autoComplete="new-password"
          required
          autoFocus
        />
      </label>
      <div className={formStyles.hint}>
        Foydalanuvchining barcha eski sessiyalari tugatiladi.
      </div>
      {error && <div className={formStyles.error}>{error}</div>}
      <div className={formStyles.actions}>
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

export default function UsersPage() {
  const { user: me } = useAuth();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);
  const [role, setRole] = useState<RoleName | "">("");
  const [page, setPage] = useState(0);

  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const [resetting, setResetting] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", { q, role, page }],
    queryFn: () =>
      usersApi.list({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        q: q || undefined,
        role: role || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["users"] });

  const create = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      refresh();
      setEditing(null);
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      full_name: string;
      role: RoleName;
    }) => usersApi.update(id, data),
    onSuccess: () => {
      refresh();
      setEditing(null);
    },
  });

  const reset = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      usersApi.resetPassword(id, password),
    onSuccess: () => setResetting(null),
  });

  const remove = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: () => {
      refresh();
      setDeleting(null);
    },
  });

  const openForm = (value: AdminUser | "new") => {
    create.reset();
    update.reset();
    setEditing(value);
  };

  const columns: Column<AdminUser>[] = [
    { key: "id", header: "ID", width: "70px", render: (r) => r.id },
    {
      key: "login",
      header: "Login",
      render: (r) => <strong>{r.login}</strong>,
    },
    { key: "name", header: "Ismi", render: (r) => r.full_name },
    {
      key: "role",
      header: "Rol",
      render: (r) => (
        <span className={`${styles.badge} ${styles[`role_${r.role.name}`]}`}>
          {ROLE_LABELS[r.role.name]}
        </span>
      ),
    },
    {
      key: "created",
      header: "Yaratilgan",
      width: "120px",
      render: (r) => formatDate(r.created_at),
    },
    {
      key: "actions",
      header: "",
      width: "320px",
      render: (r) => (
        <div className={styles.rowActions}>
          <Button size="sm" variant="secondary" onClick={() => openForm(r)}>
            O'zgartirish
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              reset.reset();
              setResetting(r);
            }}
          >
            Parol
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={r.id === me?.id}
            title={r.id === me?.id ? "O'zingizni o'chira olmaysiz" : undefined}
            onClick={() => {
              remove.reset();
              setDeleting(r);
            }}
          >
            O'chirish
          </Button>
        </div>
      ),
    },
  ];

  const hasNext = data ? (page + 1) * PAGE_SIZE < data.total : false;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>
          Foydalanuvchilar
          {data && <span className={styles.total}>Jami: {data.total}</span>}
        </h1>
        <Button onClick={() => openForm("new")}>+ Foydalanuvchi</Button>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.search}
          placeholder="Login yoki ism bo'yicha qidirish..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <select
          className={styles.select}
          value={role}
          onChange={(e) => {
            setRole(e.target.value as RoleName | "");
            setPage(0);
          }}
        >
          <option value="">Barcha rollar</option>
          {ROLE_NAMES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {error && <div className={styles.error}>{getErrorMessage(error)}</div>}

      <Table
        columns={columns}
        rows={data?.items}
        rowKey={(r) => r.id}
        loading={isLoading}
      />
      <Pagination page={page} hasNext={hasNext} onChange={setPage} />

      <Modal
        open={editing !== null}
        title={
          editing === "new"
            ? "Yangi foydalanuvchi"
            : "Foydalanuvchini o'zgartirish"
        }
        onClose={() => setEditing(null)}
      >
        <UserForm
          initial={editing && editing !== "new" ? editing : undefined}
          lockRole={
            editing !== null && editing !== "new" && editing.id === me?.id
          }
          submitting={create.isPending || update.isPending}
          error={
            create.error
              ? getErrorMessage(create.error)
              : update.error
                ? getErrorMessage(update.error)
                : ""
          }
          onCreate={(data) => create.mutate(data)}
          onUpdate={(data) =>
            editing &&
            editing !== "new" &&
            update.mutate({ id: editing.id, ...data })
          }
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <Modal
        open={resetting !== null}
        title={`Parolni tiklash: ${resetting?.login ?? ""}`}
        onClose={() => setResetting(null)}
      >
        <ResetPasswordForm
          submitting={reset.isPending}
          error={reset.error ? getErrorMessage(reset.error) : ""}
          onSubmit={(password) =>
            resetting && reset.mutate({ id: resetting.id, password })
          }
          onCancel={() => setResetting(null)}
        />
      </Modal>

      <Modal
        open={deleting !== null}
        title="O'chirishni tasdiqlang"
        onClose={() => setDeleting(null)}
      >
        <p>
          <strong>{deleting?.login}</strong> o'chirilsinmi? Uning kirish huquqi
          darhol bekor qilinadi.
        </p>
        {remove.error && (
          <div className={styles.error}>{getErrorMessage(remove.error)}</div>
        )}
        <div className={formStyles.actions}>
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            disabled={remove.isPending}
            onClick={() => deleting && remove.mutate(deleting.id)}
          >
            O'chirish
          </Button>
        </div>
      </Modal>
    </div>
  );
}
