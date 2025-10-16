import { Icon } from "@iconify/react";

import {
  Pg,
  PgContent,
  PgDescription,
  PgFooter,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { Progress } from "@/components/ui/progress";
import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bg } from "@/components/custom/bg";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import { ButtonClose } from "@/components/custom/button-close";
import { unstable_cache } from "next/cache";

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
    <Bg>
      <Pg className="relative">
        <ButtonClose href="/" />
        <Suspense
          fallback={
            <ContainerCenter>
              <LoadingSpinner />
            </ContainerCenter>
          }
        >
          <Project projectId={projectId} />
        </Suspense>
      </Pg>
    </Bg>
  );
}

async function getProject(projectId: string) {
  "use server";
  return await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: {
      id: true,
      name: true,
      description: true,
      color: true,
    },
    with: {
      sprints: {
        columns: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          finishDate: true,
          progress: true,
        },
        orderBy: (sprints, { asc }) => [asc(sprints.startDate)],
        with: {
          docReview: {
            columns: {
              id: true,
            },
          },
          docRetrospective: {
            columns: {
              id: true,
            },
          },
        },
      },
    },
  });
}

async function Project({ projectId }: { projectId: string }) {
  const getCachedProject = unstable_cache(getProject, ["project", projectId], {
    tags: ["project", projectId],
  });

  const project = await getCachedProject(projectId);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <>
      <PgHeader>
        <PgTitle className="max-w-xl">{project.name}</PgTitle>
        <PgDescription>{project.description}</PgDescription>
      </PgHeader>

      <PgContent className="space-y-6 prose">
        <h2>Sprints</h2>

        <ul>
          {project.sprints.length > 0 ? (
            project.sprints.map((sprint) => (
              <li key={sprint.id}>
                {/* <Icon
                  icon="fluent:arrow-sprint-16-filled"
                  className="text-primary/40 w-12 h-12"
                /> */}
                <div className="font-semibold">{sprint.name}</div>
                <div className="text-muted-foreground">
                  {sprint.description}
                </div>

                <Progress value={sprint.progress} className="mt-1" />

                <div className="flex justify-between text-muted-foreground mt-1">
                  {sprint.startDate && (
                    <small>
                      {new Date(sprint.startDate).toLocaleDateString("pt-BR")}
                    </small>
                  )}
                  {sprint.finishDate && (
                    <small>
                      {new Date(sprint.finishDate).toLocaleDateString("pt-BR")}
                    </small>
                  )}
                </div>

                <div className="flex justify-end gap-6 mt-2">
                  <Link
                    href={`/projects/${projectId}/sprints/${sprint.id}/tasks`}
                    className="flex items-center gap-2 rounded bg-border/30 px-2 py-1"
                  >
                    <Icon
                      icon="tabler:layout-kanban-filled"
                      className="w-7 h-7 cursor-pointer text-primary"
                    />
                    <span className="text-xs">Tarefas</span>
                  </Link>

                  {sprint.docRetrospective ? (
                    <Link
                      href={`/projects/${projectId}/sprints/${sprint.id}/retrospective`}
                      className="flex items-center gap-2 rounded bg-border/30 px-2 py-1"
                    >
                      <Icon
                        icon="tabler:file-text"
                        className="w-7 h-7 cursor-pointer text-primary"
                      />
                      <span className="text-xs">Retrospective</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/projects/${projectId}/sprints/${sprint.id}/retrospective/create`}
                      className="flex items-center gap-2 rounded bg-border/30 px-2 py-1"
                    >
                      <Icon
                        icon="tabler:file-text"
                        className="w-7 h-7 cursor-pointer text-muted-foreground"
                      />
                      <span className="text-xs">Criar Retrospective</span>
                    </Link>
                  )}

                  {sprint.docReview ? (
                    <Link
                      href={`/projects/${projectId}/sprints/${sprint.id}/review`}
                      className="flex items-center gap-2 rounded bg-border/30 px-2 py-1"
                    >
                      <Icon
                        icon="solar:document-text-bold"
                        className="w-7 h-7 cursor-pointer text-primary"
                      />
                      <span className="text-xs">Ver Review</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/projects/${projectId}/sprints/${sprint.id}/review/create`}
                      className="flex items-center gap-2 rounded bg-border/30 px-2 py-1"
                    >
                      <Icon
                        icon="solar:document-text-bold"
                        className="w-7 h-7 cursor-pointer text-muted-foreground"
                      />
                      <span className="text-xs">Criar Review</span>
                    </Link>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground">Nenhuma sprint encontrada</li>
          )}
        </ul>
      </PgContent>

      <PgFooter className="flex justify-end mt-auto">
        <Link href={`/projects/${projectId}/sprints/create`}>
          <Button className="flex items-center gap-2" variant="secondary">
            <PlusIcon />
            Criar nova Sprint
          </Button>
        </Link>
      </PgFooter>
    </>
  );
}
