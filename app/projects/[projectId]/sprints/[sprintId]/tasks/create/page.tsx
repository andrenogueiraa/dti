import CreateTaskForm from "./form";
import { Bg } from "@/components/custom/bg";
import { ButtonClose } from "@/components/custom/button-close";
import { ContainerCenter } from "@/components/custom/container-center";
import { Card } from "@/components/ui/card";

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
      <ContainerCenter>
        <Card className="w-full max-w-md mx-auto relative">
          <ButtonClose
            href={`/projects/${projectId}/sprints/${sprintId}/tasks`}
          />
          <CreateTaskForm projectId={projectId} sprintId={sprintId} />
        </Card>
      </ContainerCenter>
    </Bg>
  );
}
