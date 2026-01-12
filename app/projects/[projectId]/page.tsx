"use cache";

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

import { Suspense } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bg } from "@/components/custom/bg";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import { ButtonClose } from "@/components/custom/button-close";
// import { db } from "@/drizzle";
import { getProject } from "./server-actions";
import { ProjectCarousel } from "./carousel";
import { EndDate } from "./client";
import { formatLocalDate } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUSES } from "@/enums/project-statuses";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const metadata = {
  title: "Projeto",
  description: "Descrição do projeto",
};

// export async function generateStaticParams() {
//   const projects = await db.query.projects.findMany({
//     columns: {
//       id: true,
//     },
//   });

//   return projects.map((project) => ({
//     id: project.id,
//   }));
// }

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

async function Project({ projectId }: { projectId: string }) {
  const project = await getProject(projectId);

  if (!project) {
    return <div>Project not found</div>;
  }

  const statusLabel =
    PROJECT_STATUSES.find((s) => s.value === project.status)?.label ||
    project.status;

  return (
    <>
      <PgHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <PgTitle className="max-w-xl">{project.name}</PgTitle>
            <PgDescription>{project.description}</PgDescription>
          </div>
          <Link href={`/projects/${projectId}/change-status`}>
            <Badge variant="outline" className="cursor-pointer">
              {statusLabel}
            </Badge>
          </Link>
        </div>
      </PgHeader>

      <PgContent className="space-y-6">
        <ProjectCarousel images={project.images} projectId={projectId} />

        <div className="prose">
          <h2 className="prose">Sprints</h2>
        </div>

        <ul className="space-y-8">
          {project.sprints.length > 0 ? (
            project.sprints.map((sprint) => (
              <li key={sprint.id} className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <div className="font-semibold">{sprint.name}</div>
                  <div className="text-muted-foreground">
                    {sprint.description}
                  </div>

                  <Progress value={50} className="mt-2" />

                  <div className="flex justify-between text-muted-foreground pt-1">
                    {sprint.startDate && (
                      <small>
                        {formatLocalDate(sprint.startDate, "pt-BR")}
                      </small>
                    )}
                    {sprint.finishDate && (
                      <EndDate
                        project={project}
                        sprintId={sprint.id}
                        sprintFinishDate={new Date(sprint.finishDate)}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
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

                  {/* {sprint.docRetrospective ? (
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
                  )} */}

                  {sprint.docReview && sprint.docReview.finishedAt ? (
                    <Link
                      href={`/projects/${projectId}/sprints/${sprint.id}/review`}
                      className="flex items-center gap-2 rounded bg-border/30 px-2 py-1"
                    >
                      <Icon
                        icon="solar:document-text-bold"
                        className="w-7 h-7 cursor-pointer text-muted-foreground"
                      />
                      <span className="text-xs">Ver Review</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/projects/${projectId}/sprints/${sprint.id}/review/edit`}
                      className="flex items-center gap-2 rounded bg-border/30 px-2 py-1"
                    >
                      <Icon
                        icon="solar:document-text-bold"
                        className="w-7 h-7 cursor-pointer text-primary"
                      />
                      <span className="text-xs">Editar Review</span>
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
        {(() => {
          const lastSprint = project.sprints[project.sprints.length - 1];
          const canCreateSprint =
            !lastSprint || lastSprint.docReview?.finishedAt !== null;

          const buttonContent = (
            <>
              <PlusIcon />
              Criar nova Sprint
            </>
          );

          if (canCreateSprint) {
            return (
              <Link href={`/projects/${projectId}/sprints/create`}>
                <Button className="flex items-center gap-2" variant="secondary">
                  {buttonContent}
                </Button>
              </Link>
            );
          }

          return (
            <Tooltip>
              <TooltipTrigger>
                <div>
                  <Button
                    className="flex items-center gap-2"
                    variant="secondary"
                    disabled
                  >
                    {buttonContent}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Finalize a Sprint Review da sprint anterior para criar uma
                  nova sprint.
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })()}
      </PgFooter>
    </>
  );
}
