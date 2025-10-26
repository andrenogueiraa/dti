import { Suspense } from "react";
import { getSprintReview } from "./server-actions";
import EditSprintReviewForm from "./form";

export default async function Server({
  params,
}: {
  params: Promise<{ projectId: string; sprintId: string }>;
}) {
  const { projectId, sprintId } = await params;

  if (!projectId || !sprintId) {
    return <div>Project or sprint not found</div>;
  }

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SprintReview sprintId={sprintId} projectId={projectId} />
    </Suspense>
  );
}

async function SprintReview({
  sprintId,
  projectId,
}: {
  sprintId: string;
  projectId: string;
}) {
  const sprintReview = await getSprintReview(sprintId);

  if (!sprintReview) {
    return <div>Ocorreu um erro ao carregar a sprint.</div>;
  }

  const docReview = sprintReview.docReview;

  if (!docReview) {
    return <div>Ocorreu um erro ao carregar a sprint review.</div>;
  }

  if (docReview.finishedAt) {
    return <div>O documento já foi finalizado. Você não pode editá-lo.</div>;
  }

  return (
    <EditSprintReviewForm
      docReview={docReview}
      projectId={projectId}
      sprintId={sprintId}
    />
  );
}
