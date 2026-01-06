import { ContainerCenter } from "@/components/custom/container-center";
import { Card } from "@/components/ui/card";
import { ButtonClose } from "@/components/custom/button-close";
import { Bg } from "@/components/custom/bg";
import { ChangeStatusForm } from "./client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import { getProjectStatus } from "./server-actions";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <Bg>
      <ContainerCenter>
        <Card className="w-full max-w-md mx-auto relative min-h-40">
          <ButtonClose href={`/projects/${projectId}`} />

          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            }
          >
            <ProjectStatus projectId={projectId} />
          </Suspense>
        </Card>
      </ContainerCenter>
    </Bg>
  );
}

async function ProjectStatus({ projectId }: { projectId: string }) {
  const project = await getProjectStatus(projectId);

  if (!project) {
    return <div>Status não encontrado</div>;
  }

  return (
    <ChangeStatusForm projectId={projectId} currentStatus={project.status} />
  );
}
