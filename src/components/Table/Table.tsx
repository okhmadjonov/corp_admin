import type { ReactNode } from "react";
import styles from "./Table.module.scss";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyText?: string;
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyText = "Ma'lumot yo'q",
}: Props<T>) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className={styles.info}>
                Yuklanmoqda...
              </td>
            </tr>
          ) : !rows || rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.info}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
