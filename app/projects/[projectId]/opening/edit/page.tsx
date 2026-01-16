import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getProjectOpening, createProjectOpening } from "./server-actions";
import EditProjectOpeningForm from "./form";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";

export default async function Server({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  if (!projectId) {
    return <div>Project not found</div>;
  }

  return (
    <Suspense
      fallback={
        <ContainerCenter>
          <LoadingSpinner />
        </ContainerCenter>
      }
    >
      <ProjectOpening projectId={projectId} />
    </Suspense>
  );
}

async function ProjectOpening({ projectId }: { projectId: string }) {
  const docOpening = await getProjectOpening(projectId);

  // Se o documento não existe, criar automaticamente e redirecionar
  if (!docOpening) {
    await createProjectOpening(projectId);
    // Redirecionar para recarregar a página e evitar chamar revalidatePath durante render
    redirect(`/projects/${projectId}/opening/edit`);
  }

  // Se o documento está finalizado, redirecionar para visualização
  if (docOpening.finishedAt) {
    redirect(`/projects/${projectId}/opening`);
  }

  return (
    <EditProjectOpeningForm docOpening={docOpening} projectId={projectId} />
  );
}
