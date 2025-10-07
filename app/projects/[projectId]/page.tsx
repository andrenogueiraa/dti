import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { Progress } from "@/components/ui/progress";
import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";
import { Suspense } from "react";

export const metadata = {
  title: "Projeto",
  description: "Descrição do projeto",
};

export default async function Server({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Project projectId={projectId} />
    </Suspense>
  );
}

async function getProject(projectId: string) {
  "use server";
  return await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      sprints: {
        orderBy: (sprints, { asc }) => [asc(sprints.startDate)],
      },
    },
  });
}

async function Project({ projectId }: { projectId: string }) {
  const project = await getProject(projectId);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <Pg>
      <PgHeader>
        <PgTitle>{project.name}</PgTitle>
        <PgDescription>{project.description}</PgDescription>
      </PgHeader>
      <PgContent className="space-y-6">
        {project.sprints.map((sprint) => (
          <div key={sprint.id}>
            <span className="font-semibold">{sprint.name}: </span>
            <span className="text-muted-foreground">{sprint.description}</span>
            <Progress value={sprint.progress} className="mt-1" />
            <div className="flex justify-between text-muted-foreground mt-1">
              <small>{sprint.startDate?.toLocaleDateString()}</small>
              <small>{sprint.finishDate?.toLocaleDateString()}</small>
            </div>
          </div>
        ))}
      </PgContent>
    </Pg>
  );
}
