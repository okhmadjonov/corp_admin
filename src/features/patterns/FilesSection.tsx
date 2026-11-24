import { useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/Button/Button";
import { Modal } from "@/components/Modal/Modal";
import { patternsApi } from "@/api/patterns";
import { uploadsApi } from "@/api/uploads";
import type { FileKind, PatternFile } from "@/types/patterns";
import { getErrorMessage } from "@/utils/errors";
import { mediaUrl } from "@/utils/media";
import styles from "@/features/clothes/Sections.module.scss";

interface Props {
  patternId: number;
  files: PatternFile[];
}

const ALLOWED: Record<FileKind, string[]> = {
  preview: ["image/jpeg", "image/png", "image/webp"],
  download: ["application/pdf"],
};

export function FilesSection({ patternId, files }: Props) {
  const qc = useQueryClient();
  const previewInput = useRef<HTMLInputElement>(null);
  const downloadInput = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState("");
  const [deleting, setDeleting] = useState<PatternFile | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["patterns"] });

  const previews = files
    .filter((f) => f.kind === "preview")
    .sort(
      (a, b) =>
        Number(b.is_main) - Number(a.is_main) ||
        a.sort_order - b.sort_order ||
        a.id - b.id,
    );
  const downloads = files.filter((f) => f.kind === "download");

  const upload = useMutation({
    mutationFn: async ({ list, kind }: { list: File[]; kind: FileKind }) => {
      const existing = files.filter((f) => f.kind === kind).length;
      for (const [i, file] of list.entries()) {
        const uploaded = await uploadsApi.upload(file);
        await patternsApi.addFile(patternId, {
          url: uploaded.url,
          kind,
          file_type: uploaded.file_type,
          sort_order: existing + i,
          // faqat birinchi preview rasm asosiy bo'ladi
          is_main: kind === "preview" && existing === 0 && i === 0,
        });
      }
    },
    onSettled: refresh,
  });

  const makeMain = useMutation({
    mutationFn: (f: PatternFile) =>
      patternsApi.updateFile(patternId, f.id, {
        url: f.url,
        kind: f.kind,
        file_type: f.file_type,
        sort_order: f.sort_order,
        is_main: true,
      }),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (id: number) => patternsApi.removeFile(patternId, id),
    onSuccess: () => {
      refresh();
      setDeleting(null);
    },
  });

  const onPick = (kind: FileKind) => (e: ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (list.length === 0) return;

    const bad = list.find((f) => !ALLOWED[kind].includes(f.type));
    if (bad) {
      setLocalError(
        kind === "preview"
          ? `"${bad.name}" mos emas. Preview uchun JPG, PNG yoki WEBP kerak`
          : `"${bad.name}" mos emas. Yuklab olinadigan fayl PDF bo'lishi kerak`,
      );
      return;
    }
    setLocalError("");
    upload.mutate({ list, kind });
  };

  const errorMessage =
    localError ||
    (upload.error && getErrorMessage(upload.error)) ||
    (makeMain.error && getErrorMessage(makeMain.error)) ||
    "";

  const fileName = (url: string) => url.split("/").pop() ?? url;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Fayllar</h2>
      </div>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}

      <div className={styles.header}>
        <h3 className={styles.subtitle}>
          Preview rasmlar (saytda hammaga ko'rinadi)
        </h3>
        <Button
          disabled={upload.isPending}
          onClick={() => previewInput.current?.click()}
        >
          + Rasm
        </Button>
        <input
          ref={previewInput}
          type="file"
          accept={ALLOWED.preview.join(",")}
          multiple
          hidden
          onChange={onPick("preview")}
        />
      </div>

      {previews.length === 0 ? (
        <p className={styles.hint}>
          Hali preview rasm yo'q. Birinchi yuklangan rasm asosiy bo'ladi.
        </p>
      ) : (
        <div className={styles.grid}>
          {previews.map((f) => (
            <div key={f.id} className={styles.card}>
              <div className={styles.thumbWrap}>
                <img className={styles.thumb} src={mediaUrl(f.url)} alt="" />
                {f.is_main && <span className={styles.badge}>Asosiy</span>}
              </div>
              <div className={styles.cardActions}>
                {!f.is_main && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={makeMain.isPending}
                    onClick={() => makeMain.mutate(f)}
                  >
                    Asosiy qilish
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    remove.reset();
                    setDeleting(f);
                  }}
                >
                  O'chirish
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.header}>
        <h3 className={styles.subtitle}>
          Yuklab olinadigan PDF (yopiq, hammaga ko'rinmaydi)
        </h3>
        <Button
          disabled={upload.isPending}
          onClick={() => downloadInput.current?.click()}
        >
          + PDF
        </Button>
        <input
          ref={downloadInput}
          type="file"
          accept={ALLOWED.download.join(",")}
          multiple
          hidden
          onChange={onPick("download")}
        />
      </div>

      {downloads.length === 0 ? (
        <p className={styles.hint}>Hali PDF yo'q.</p>
      ) : (
        <div className={styles.fileList}>
          {downloads.map((f) => (
            <div key={f.id} className={styles.fileRow}>
              <span>📄 {fileName(f.url)}</span>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  remove.reset();
                  setDeleting(f);
                }}
              >
                O'chirish
              </Button>
            </div>
          ))}
        </div>
      )}

      {upload.isPending && <p className={styles.hint}>Yuklanmoqda...</p>}

      <Modal
        open={deleting !== null}
        title="O'chirishni tasdiqlang"
        onClose={() => setDeleting(null)}
      >
        <p>Bu fayl o'chirilsinmi?</p>
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
