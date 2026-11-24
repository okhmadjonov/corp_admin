import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { categoriesApi } from "@/api/categories";
import { clothesApi } from "@/api/clothes";
import { FullPageLoader } from "@/components/FullPageLoader/FullPageLoader";
import { ClothesForm } from "@/features/clothes/ClothesForm";
import { ImagesSection } from "@/features/clothes/ImagesSection";
import { VariantsSection } from "@/features/clothes/VariantsSection";
import type { ClothesInput, NamedItem, Tag } from "@/types/clothes";
import { getErrorMessage } from "@/utils/errors";
import styles from "./ClothesFormPage.module.scss";

export default function ClothesFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const clothesId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const clothesQuery = useQuery({
    queryKey: ["clothes", "detail", clothesId],
    queryFn: () => clothesApi.get(clothesId),
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
    mutationFn: (data: ClothesInput) =>
      isNew ? clothesApi.create(data) : clothesApi.update(clothesId, data),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ["clothes"] });
      if (isNew) navigate(`/clothes/${saved.id}`, { replace: true });
    },
  });

  const loadError =
    clothesQuery.error || genders.error || seasons.error || tags.error;
  if (loadError) return <p>{getErrorMessage(loadError)}</p>;

  const ready =
    genders.data && seasons.data && tags.data && (isNew || clothesQuery.data);
  if (!ready) return <FullPageLoader />;

  const clothes = clothesQuery.data;

  return (
    <div className={styles.stack}>
      <h1 className={styles.heading}>
        {isNew ? "Yangi kiyim" : clothes?.name}
      </h1>

      <ClothesForm
        key={clothes?.id ?? "new"}
        initial={clothes}
        genders={genders.data}
        seasons={seasons.data}
        tags={tags.data}
        submitting={save.isPending}
        error={save.error ? getErrorMessage(save.error) : ""}
        saved={save.isSuccess}
        onSubmit={(data) => save.mutate(data)}
        onCancel={() => navigate("/clothes")}
      />

      {isNew ? (
        <p className={styles.hint}>
          Rasm va variantlarni kiyim saqlangandan keyin shu sahifada qo'shasiz.
        </p>
      ) : (
        clothes && (
          <>
            <ImagesSection clothesId={clothes.id} images={clothes.images} />
            <VariantsSection
              clothesId={clothes.id}
              variants={clothes.variants}
            />
          </>
        )
      )}
    </div>
  );
}
