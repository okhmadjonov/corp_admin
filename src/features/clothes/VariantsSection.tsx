import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/Button/Button";
import { Modal } from "@/components/Modal/Modal";
import { Table, type Column } from "@/components/Table/Table";
import { clothesApi } from "@/api/clothes";
import type { ClothesVariant, VariantInput } from "@/types/clothes";
import { getErrorMessage } from "@/utils/errors";
import { formatPrice } from "@/utils/format";
import styles from "./Sections.module.scss";

interface Props {
  clothesId: number;
  variants: ClothesVariant[];
}

interface FormProps {
  initial?: ClothesVariant;
  submitting: boolean;
  error: string;
  onSubmit: (data: VariantInput) => void;
  onCancel: () => void;
}

function VariantForm({
  initial,
  submitting,
  error,
  onSubmit,
  onCancel,
}: FormProps) {
  const [size, setSize] = useState(initial?.size ?? "");
  const [color, setColor] = useState(initial?.color ?? "");
  const [price, setPrice] = useState(
    initial ? String(Number(initial.price)) : "",
  );
  const [stock, setStock] = useState(String(initial?.stock_quantity ?? 0));
  const [sku, setSku] = useState(initial?.sku ?? "");

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          size: size.trim(),
          color: color.trim(),
          price: price.trim(),
          stock_quantity: Number(stock) || 0,
          sku: sku.trim(),
        });
      }}
    >
      <div className={styles.row}>
        <label className={styles.field}>
          <span>O'lcham *</span>
          <input
            value={size}
            onChange={(e) => setSize(e.target.value)}
            maxLength={20}
            placeholder="M"
            required
            autoFocus
          />
        </label>
        <label className={styles.field}>
          <span>Rang *</span>
          <input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            maxLength={50}
            placeholder="Qora"
            required
          />
        </label>
      </div>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>Narx (so'm) *</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>
        <label className={styles.field}>
          <span>Ombordagi soni</span>
          <input
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </label>
      </div>
      <label className={styles.field}>
        <span>SKU (noyob kod) *</span>
        <input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          maxLength={64}
          placeholder="PALTO-M-QORA"
          required
        />
      </label>

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

export function VariantsSection({ clothesId, variants }: Props) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ClothesVariant | "new" | null>(null);
  const [deleting, setDeleting] = useState<ClothesVariant | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["clothes"] });

  const save = useMutation({
    mutationFn: (data: VariantInput) =>
      editing && editing !== "new"
        ? clothesApi.updateVariant(clothesId, editing.id, data)
        : clothesApi.addVariant(clothesId, data),
    onSuccess: () => {
      refresh();
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => clothesApi.removeVariant(clothesId, id),
    onSuccess: () => {
      refresh();
      setDeleting(null);
    },
  });

  const openForm = (value: ClothesVariant | "new") => {
    save.reset();
    setEditing(value);
  };

  const columns: Column<ClothesVariant>[] = [
    { key: "size", header: "O'lcham", width: "90px", render: (r) => r.size },
    { key: "color", header: "Rang", render: (r) => r.color },
    { key: "price", header: "Narx", render: (r) => formatPrice(r.price) },
    {
      key: "stock",
      header: "Omborda",
      width: "100px",
      render: (r) => r.stock_quantity,
    },
    { key: "sku", header: "SKU", render: (r) => r.sku },
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
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Variantlar (o'lcham va rang)</h2>
        <Button onClick={() => openForm("new")}>+ Variant</Button>
      </div>

      <Table
        columns={columns}
        rows={variants}
        rowKey={(r) => r.id}
        emptyText="Hali variant yo'q. Kamida bitta variant qo'shing, aks holda narx ko'rinmaydi"
      />

      <Modal
        open={editing !== null}
        title={editing === "new" ? "Yangi variant" : "Variantni o'zgartirish"}
        onClose={() => setEditing(null)}
      >
        <VariantForm
          initial={editing && editing !== "new" ? editing : undefined}
          submitting={save.isPending}
          error={save.error ? getErrorMessage(save.error) : ""}
          onSubmit={(data) => save.mutate(data)}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <Modal
        open={deleting !== null}
        title="O'chirishni tasdiqlang"
        onClose={() => setDeleting(null)}
      >
        <p>
          <strong>
            {deleting?.size} / {deleting?.color}
          </strong>{" "}
          varianti o'chirilsinmi?
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
    </section>
  );
}
