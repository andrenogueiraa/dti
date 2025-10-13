import CreateSprintReview from "./form";

export default async function Server({
  params,
}: {
  params: Promise<{ projectId: string; sprintId: string }>;
}) {
  const { projectId, sprintId } = await params;

  if (!projectId || !sprintId) {
    return <div>Project or sprint not found</div>;
  }

  return <CreateSprintReview sprintId={sprintId} projectId={projectId} />;
}
