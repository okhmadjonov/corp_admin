import { useState, type FormEvent } from "react";
import { Button } from "@/components/Button/Button";
import type { Clothes, ClothesInput, NamedItem, Tag } from "@/types/clothes";
import styles from "./ClothesForm.module.scss";

interface FormState {
  name: string;
  description: string;
  brand: string;
  material: string;
  is_active: boolean;
  gender_id: string;
  season_id: string;
  tag_ids: number[];
}

interface Props {
  initial?: Clothes;
  genders: NamedItem[];
  seasons: NamedItem[];
  tags: Tag[];
  submitting: boolean;
  error: string;
  saved: boolean;
  onSubmit: (data: ClothesInput) => void;
  onCancel: () => void;
}

export function ClothesForm({
  initial,
  genders,
  seasons,
  tags,
  submitting,
  error,
  saved,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    brand: initial?.brand ?? "",
    material: initial?.material ?? "",
    is_active: initial?.is_active ?? true,
    gender_id: initial ? String(initial.gender.id) : "",
    season_id: initial ? String(initial.season.id) : "",
    tag_ids: initial?.tags.map((t) => t.id) ?? [],
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleTag = (id: number) =>
    set(
      "tag_ids",
      form.tag_ids.includes(id)
        ? form.tag_ids.filter((t) => t !== id)
        : [...form.tag_ids, id],
    );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || null,
      brand: form.brand.trim() || null,
      material: form.material.trim() || null,
      is_active: form.is_active,
      gender_id: Number(form.gender_id),
      season_id: Number(form.season_id),
      tag_ids: form.tag_ids,
      // pattern bog'lanishlari bu formada o'zgarmaydi, mavjudlari saqlanib qoladi
      pattern_ids: initial?.patterns.map((p) => p.id) ?? [],
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>Nomi *</span>
        <input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          maxLength={200}
          required
          autoFocus
        />
      </label>

      <label className={styles.field}>
        <span>Tavsif</span>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
        />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Brend</span>
          <input
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
            maxLength={100}
          />
        </label>
        <label className={styles.field}>
          <span>Material</span>
          <input
            value={form.material}
            onChange={(e) => set("material", e.target.value)}
            maxLength={100}
          />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Jins / yosh *</span>
          <select
            value={form.gender_id}
            onChange={(e) => set("gender_id", e.target.value)}
            required
          >
            <option value="">Tanlang</option>
            {genders.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Fasl *</span>
          <select
            value={form.season_id}
            onChange={(e) => set("season_id", e.target.value)}
            required
          >
            <option value="">Tanlang</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.field}>
        <span>Teglar</span>
        <div className={styles.chips}>
          {tags.length === 0 && (
            <em className={styles.muted}>Teglar hali yaratilmagan</em>
          )}
          {tags.map((t) => (
            <button
              key={t.id}
              type="button"
              className={
                form.tag_ids.includes(t.id)
                  ? `${styles.chip} ${styles.chipOn}`
                  : styles.chip
              }
              onClick={() => toggleTag(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <label className={styles.check}>
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => set("is_active", e.target.checked)}
        />
        <span>Saytda ko'rsatilsin (faol)</span>
      </label>

      {error && <div className={styles.error}>{error}</div>}
      {saved && !error && <div className={styles.success}>Saqlandi</div>}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Orqaga
        </Button>
        <Button type="submit" disabled={submitting || !form.name.trim()}>
          {submitting ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
}
