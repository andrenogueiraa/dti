import { SimpleMarkdownPreview } from "@/components/custom/simple-markdown-preview";
import { Suspense } from "react";
import { getSprintReview } from "./server-actions";
import { Pg, PgContent } from "@/components/ui/pg";
import { Bg } from "@/components/custom/bg";
import { ButtonClose } from "@/components/custom/button-close";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import Image from "next/image";

export const metadata = {
  title: "Sprint Review",
  description: "Ata da reunião de sprint review.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string; sprintId: string }>;
}) {
  const { projectId, sprintId } = await params;

  if (!projectId || !sprintId) {
    return <div>Project or sprint not found</div>;
  }

  return (
    <Bg>
      <Pg className="relative">
        <ButtonClose href={`/projects/${projectId}`} />
        <PgContent className="space-y-8">
          <Suspense
            fallback={
              <ContainerCenter>
                <LoadingSpinner />
              </ContainerCenter>
            }
          >
            <SprintReview sprintId={sprintId} />
          </Suspense>
        </PgContent>
      </Pg>
    </Bg>
  );
}

async function SprintReview({ sprintId }: { sprintId: string }) {
  const sprintReview = await getSprintReview(sprintId);

  if (!sprintReview) {
    return <div>Ocorreu um erro ao carregar a sprint review.</div>;
  }

  if (!sprintReview.docReview) {
    return <div>Ocorreu um erro ao carregar a ata de review.</div>;
  }

  const images = sprintReview.docReview.images;

  return (
    <>
      <SimpleMarkdownPreview
        content={sprintReview.docReview.content}
        typeLabel="Sprint Review"
        date={sprintReview.docReview.date.toLocaleDateString("pt-BR")}
      />

      {images.length > 0 && (
        <section className="prose space-y-4">
          <h2>Anexos</h2>
          <div className="grid gap-6">
            {images.map((image) => (
              <div key={image.id}>
                <Image
                  src={image.url || ""}
                  alt={image.originalName}
                  width={image.width || 800}
                  height={image.height || 600}
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
