import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { patternsApi } from "@/api/patterns";
import type { Pattern } from "@/types/patterns";
import { getErrorMessage } from "@/utils/errors";
import { formatPrice } from "@/utils/format";
import { mediaUrl } from "@/utils/media";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import styles from "@/pages/ClothesListPage/ClothesListPage.module.scss";

const PAGE_SIZE = 20;

function previewImage(p: Pattern) {
  const images = p.files.filter(
    (f) => f.kind === "preview" && f.file_type === "image",
  );
  return images.find((f) => f.is_main) ?? images[0];
}

export default function PatternsListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<Pattern | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["patterns", "list", { q, page }],
    queryFn: () =>
      patternsApi.list({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        q: q || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const remove = useMutation({
    mutationFn: (id: number) => patternsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patterns"] });
      setDeleting(null);
    },
  });

  const columns: Column<Pattern>[] = [
    {
      key: "image",
      header: "",
      width: "70px",
      render: (r) => {
        const img = previewImage(r);
        return img ? (
          <img className={styles.thumb} src={mediaUrl(img.thumb_url ?? img.url)} alt="" />
        ) : (
          <div className={styles.noImage} />
        );
      },
    },
    { key: "name", header: "Nomi", render: (r) => <strong>{r.name}</strong> },
    { key: "price", header: "Narx", render: (r) => formatPrice(r.price) },
    { key: "gender", header: "Jins / yosh", render: (r) => r.gender.name },
    { key: "season", header: "Fasl", render: (r) => r.season.name },
    {
      key: "files",
      header: "Fayllar",
      width: "90px",
      render: (r) => r.files.length,
    },
    {
      key: "views",
      header: "Ko'rishlar",
      width: "100px",
      render: (r) => r.views_count,
    },
    {
      key: "status",
      header: "Holati",
      width: "100px",
      render: (r) => (
        <span className={r.is_active ? styles.on : styles.off}>
          {r.is_active ? "Faol" : "Nofaol"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "200px",
      render: (r) => (
        <div className={styles.rowActions}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/patterns/${r.id}`)}
          >
            Tahrirlash
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
        <h1 className={styles.heading}>Patternlar</h1>
        <Button onClick={() => navigate("/patterns/new")}>
          + Yangi pattern
        </Button>
      </div>

      <input
        className={styles.search}
        placeholder="Nomi bo'yicha qidirish..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
      />

      {error && <div className={styles.error}>{getErrorMessage(error)}</div>}

      <Table
        columns={columns}
        rows={data?.items}
        rowKey={(r) => r.id}
        loading={isLoading}
      />
      <Pagination
        page={page}
        hasNext={data ? (page + 1) * PAGE_SIZE < data.total : false}
        onChange={setPage}
      />

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
        <div className={styles.modalActions}>
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
