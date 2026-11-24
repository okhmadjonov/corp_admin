import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/Button/Button";
import { Modal } from "@/components/Modal/Modal";
import { Table, type Column } from "@/components/Table/Table";
import {
  categoriesApi,
  type Category,
  type CategoryKind,
} from "@/api/categories";
import { getErrorMessage } from "@/utils/errors";
import styles from "./CategoryTab.module.scss";

interface Props {
  kind: CategoryKind;
  title: string;
  showSlug?: boolean;
}

interface FormProps {
  initial: string;
  submitting: boolean;
  error: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

function CategoryForm({
  initial,
  submitting,
  error,
  onSubmit,
  onCancel,
}: FormProps) {
  const [name, setName] = useState(initial);

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(name.trim());
      }}
    >
      <label className={styles.field}>
        <span>Nomi</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          autoFocus
          required
        />
      </label>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={submitting || !name.trim()}>
          Saqlash
        </Button>
      </div>
    </form>
  );
}

export function CategoryTab({ kind, title, showSlug }: Props) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["categories", kind],
    queryFn: () => categoriesApi.list(kind),
  });

  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["categories", kind] });

  const save = useMutation({
    mutationFn: (name: string) =>
      editing && editing !== "new"
        ? categoriesApi.update(kind, editing.id, name)
        : categoriesApi.create(kind, name),
    onSuccess: () => {
      refresh();
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => categoriesApi.remove(kind, id),
    onSuccess: () => {
      refresh();
      setDeleting(null);
    },
  });

  const openForm = (value: Category | "new") => {
    save.reset();
    setEditing(value);
  };

  const columns: Column<Category>[] = [
    { key: "id", header: "ID", width: "80px", render: (r) => r.id },
    { key: "name", header: "Nomi", render: (r) => r.name },
    ...(showSlug
      ? [{ key: "slug", header: "Slug", render: (r: Category) => r.slug }]
      : []),
    {
      key: "actions",
      header: "",
      width: "200px",
      render: (r) => (
        <div className={styles.rowActions}>
          <Button size="sm" variant="secondary" onClick={() => openForm(r)}>
            O'zgartirish
          </Button>
          <Button
            size="sm"
            variant="danger"
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

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <Button onClick={() => openForm("new")}>+ Qo'shish</Button>
      </div>

      {error && <div className={styles.error}>{getErrorMessage(error)}</div>}

      <Table
        columns={columns}
        rows={data}
        rowKey={(r) => r.id}
        loading={isLoading}
      />

      <Modal
        open={editing !== null}
        title={editing === "new" ? "Yangi qo'shish" : "O'zgartirish"}
        onClose={() => setEditing(null)}
      >
        <CategoryForm
          initial={editing && editing !== "new" ? editing.name : ""}
          submitting={save.isPending}
          error={save.error ? getErrorMessage(save.error) : ""}
          onSubmit={(name) => save.mutate(name)}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <Modal
        open={deleting !== null}
        title="O'chirishni tasdiqlang"
        onClose={() => setDeleting(null)}
      >
        <p>
          <strong>{deleting?.name}</strong> o'chirilsinmi?
        </p>
        {remove.error && (
          <div className={styles.error}>{getErrorMessage(remove.error)}</div>
        )}
        <div className={styles.actions}>
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
