import { useState } from "react";
import { CategoryTab } from "@/features/categories/CategoryTab";
import type { CategoryKind } from "@/api/categories";
import styles from "./CategoriesPage.module.scss";

const TABS: { kind: CategoryKind; label: string; showSlug?: boolean }[] = [
  { kind: "genders", label: "Jins / yosh" },
  { kind: "seasons", label: "Fasllar" },
  { kind: "tags", label: "Teglar", showSlug: true },
];

export default function CategoriesPage() {
  const [active, setActive] = useState(TABS[0]);

  return (
    <div>
      <h1 className={styles.heading}>Kategoriyalar</h1>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.kind}
            type="button"
            className={
              tab.kind === active.kind
                ? `${styles.tab} ${styles.active}`
                : styles.tab
            }
            onClick={() => setActive(tab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <CategoryTab
        key={active.kind}
        kind={active.kind}
        title={active.label}
        showSlug={active.showSlug}
      />
    </div>
  );
}
