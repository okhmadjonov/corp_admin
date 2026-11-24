import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { categoriesApi } from "@/api/categories";
import { patternsApi } from "@/api/patterns";
import { FullPageLoader } from "@/components/FullPageLoader/FullPageLoader";
import { FilesSection } from "@/features/patterns/FilesSection";
import { PatternForm } from "@/features/patterns/PatternForm";
import type { NamedItem, Tag } from "@/types/clothes";
import type { PatternInput } from "@/types/patterns";
import { getErrorMessage } from "@/utils/errors";
import styles from "./PatternFormPage.module.scss";

export default function PatternFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const patternId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const patternQuery = useQuery({
    queryKey: ["patterns", "detail", patternId],
    queryFn: () => patternsApi.get(patternId),
    enabled: !isNew,
  });
  const genders = useQuery({
    queryKey: ["categories", "genders"],
    queryFn: () => categoriesApi.list("genders") as Promise<NamedItem[]>,
  });
  const seasons = useQuery({
    queryKey: ["categories", "seasons"],
    queryFn: () => categoriesApi.list("seasons") as Promise<NamedItem[]>,
  });
  const tags = useQuery({
    queryKey: ["categories", "tags"],
    queryFn: () => categoriesApi.list("tags") as Promise<Tag[]>,
  });

  const save = useMutation({
    mutationFn: (data: PatternInput) =>
      isNew ? patternsApi.create(data) : patternsApi.update(patternId, data),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ["patterns"] });
      qc.invalidateQueries({ queryKey: ["clothes"] }); // kiyim sahifalarida patternlar ro'yxati yangilansin
      if (isNew) navigate(`/patterns/${saved.id}`, { replace: true });
    },
  });

  const loadError =
    patternQuery.error || genders.error || seasons.error || tags.error;
  if (loadError) return <p>{getErrorMessage(loadError)}</p>;

  const ready =
    genders.data && seasons.data && tags.data && (isNew || patternQuery.data);
  if (!ready) return <FullPageLoader />;

  const pattern = patternQuery.data;

  return (
    <div className={styles.stack}>
      <h1 className={styles.heading}>
        {isNew ? "Yangi pattern" : pattern?.name}
      </h1>

      <PatternForm
        key={pattern?.id ?? "new"}
        initial={pattern}
        genders={genders.data}
        seasons={seasons.data}
        tags={tags.data}
        submitting={save.isPending}
        error={save.error ? getErrorMessage(save.error) : ""}
        saved={save.isSuccess}
        onSubmit={(data) => save.mutate(data)}
        onCancel={() => navigate("/patterns")}
      />

      {isNew ? (
        <p className={styles.hint}>
          Fayllarni pattern saqlangandan keyin shu sahifada yuklaysiz.
        </p>
      ) : (
        pattern && <FilesSection patternId={pattern.id} files={pattern.files} />
      )}
    </div>
  );
}
