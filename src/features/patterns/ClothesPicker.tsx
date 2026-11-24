import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { clothesApi } from "@/api/clothes";
import type { ClothesBrief } from "@/types/patterns";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import styles from "./ClothesPicker.module.scss";

interface Props {
  selected: ClothesBrief[];
  onChange: (value: ClothesBrief[]) => void;
}

export function ClothesPicker({ selected, onChange }: Props) {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ["clothes", "picker", q],
    queryFn: () => clothesApi.list({ limit: 20, offset: 0, q: q || undefined }),
  });

  const isSelected = (id: number) => selected.some((s) => s.id === id);

  const toggle = (c: ClothesBrief) =>
    onChange(
      isSelected(c.id)
        ? selected.filter((s) => s.id !== c.id)
        : [...selected, { id: c.id, name: c.name, slug: c.slug }],
    );

  return (
    <div className={styles.picker}>
      {selected.length > 0 && (
        <div className={styles.chips}>
          {selected.map((s) => (
            <button
              key={s.id}
              type="button"
              className={styles.chip}
              onClick={() => toggle(s)}
            >
              {s.name} ✕
            </button>
          ))}
        </div>
      )}

      <input
        className={styles.search}
        placeholder="Kiyim nomi bo'yicha qidirish..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className={styles.list}>
        {isLoading && <div className={styles.info}>Yuklanmoqda...</div>}
        {data?.items.length === 0 && (
          <div className={styles.info}>Kiyim topilmadi</div>
        )}
        {data?.items.map((c) => (
          <label key={c.id} className={styles.item}>
            <input
              type="checkbox"
              checked={isSelected(c.id)}
              onChange={() => toggle(c)}
            />
            <span>{c.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
