import { useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/Button/Button";
import { Modal } from "@/components/Modal/Modal";
import { clothesApi } from "@/api/clothes";
import { uploadsApi } from "@/api/uploads";
import type { ClothesImage } from "@/types/clothes";
import { getErrorMessage } from "@/utils/errors";
import { mediaUrl } from "@/utils/media";
import styles from "./Sections.module.scss";

interface Props {
  clothesId: number;
  images: ClothesImage[];
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function ImagesSection({ clothesId, images }: Props) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState("");
  const [deleting, setDeleting] = useState<ClothesImage | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["clothes"] });

  const sorted = [...images].sort(
    (a, b) =>
      Number(b.is_main) - Number(a.is_main) ||
      a.sort_order - b.sort_order ||
      a.id - b.id,
  );

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      for (const [i, file] of files.entries()) {
        const uploaded = await uploadsApi.upload(file);
        await clothesApi.addImage(clothesId, {
          url: uploaded.url,
          sort_order: images.length + i,
          is_main: images.length === 0 && i === 0,
        });
      }
    },
    onSettled: refresh,
  });

  const makeMain = useMutation({
    mutationFn: (img: ClothesImage) =>
      clothesApi.updateImage(clothesId, img.id, {
        url: img.url,
        sort_order: img.sort_order,
        is_main: true,
      }),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (id: number) => clothesApi.removeImage(clothesId, id),
    onSuccess: () => {
      refresh();
      setDeleting(null);
    },
  });

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const bad = files.find((f) => !ALLOWED.includes(f.type));
    if (bad) {
      setLocalError(
        `"${bad.name}" mos emas. Faqat JPG, PNG yoki WEBP yuklash mumkin`,
      );
      return;
    }
    setLocalError("");
    upload.mutate(files);
  };

  const errorMessage =
    localError ||
    (upload.error && getErrorMessage(upload.error)) ||
    (makeMain.error && getErrorMessage(makeMain.error)) ||
    "";

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Rasmlar</h2>
        <Button
          disabled={upload.isPending}
          onClick={() => fileRef.current?.click()}
        >
          {upload.isPending ? "Yuklanmoqda..." : "+ Rasm yuklash"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED.join(",")}
          multiple
          hidden
          onChange={onPick}
        />
      </div>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}

      {sorted.length === 0 ? (
        <p className={styles.hint}>
          Hali rasm yo'q. Birinchi yuklangan rasm avtomatik asosiy bo'ladi.
        </p>
      ) : (
        <div className={styles.grid}>
          {sorted.map((img) => (
            <div key={img.id} className={styles.card}>
              <div className={styles.thumbWrap}>
                <img className={styles.thumb} src={mediaUrl(img.thumb_url ?? img.url)} alt="" />
                {img.is_main && <span className={styles.badge}>Asosiy</span>}
              </div>
              <div className={styles.cardActions}>
                {!img.is_main && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={makeMain.isPending}
                    onClick={() => makeMain.mutate(img)}
                  >
                    Asosiy qilish
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    remove.reset();
                    setDeleting(img);
                  }}
                >
                  O'chirish
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={deleting !== null}
        title="O'chirishni tasdiqlang"
        onClose={() => setDeleting(null)}
      >
        <p>Bu rasm o'chirilsinmi?</p>
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
