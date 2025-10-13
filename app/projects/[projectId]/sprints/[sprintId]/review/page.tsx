import { SimpleMarkdownPreview } from "@/components/custom/simple-markdown-preview";
import { Suspense } from "react";
import { getSprintReview } from "./server-actions";
import { Pg, PgContent } from "@/components/ui/pg";
import { Bg } from "@/components/custom/bg";
import { ButtonClose } from "@/components/custom/button-close";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";

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
        <PgContent>
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

  return (
    <SimpleMarkdownPreview
      content={sprintReview.docReview.content}
      typeLabel="Sprint Review"
      date={sprintReview.docReview.date.toLocaleDateString("pt-BR")}
    />
  );
}
