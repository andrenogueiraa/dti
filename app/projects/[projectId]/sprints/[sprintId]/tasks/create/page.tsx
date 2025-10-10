import { ButtonClose } from "@/components/custom/button-close";
import CreateTaskForm from "./form";

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
    <>
      <ButtonClose />
      <CreateTaskForm projectId={projectId} sprintId={sprintId} />;
    </>
  );
}
