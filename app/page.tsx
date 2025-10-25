import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { Progress } from "@/components/ui/progress";
import { db } from "@/drizzle";
import { cn } from "@/lib/utils";
import { getColorClassName } from "@/enums/colors";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Visão Geral",
  description:
    "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Amet, fugit nostrum maxime consectetur obcaecati repellendus consequatur sequi omnis ab earum!",
};

export default async function Server() {
  return (
    <Pg className="max-w-full relative">
      <PgHeader>
        <PgTitle>{metadata.title}</PgTitle>
        <PgDescription>{metadata.description}</PgDescription>
      </PgHeader>

      <PgContent className="space-y-8 pr-0">
        <Suspense fallback={<div>Carregando projetos...</div>}>
          <DevTeams />
        </Suspense>

        <section className="prose space-y-4">
          <h2>Backlog de Projetos</h2>
          <Suspense fallback={<div>Carregando Backlog de Projetos...</div>}>
            <ProjectsWithNoTeam />
          </Suspense>
        </section>

        <section>
          <form action={revalidateDevTeams} className="flex justify-end">
            <Button type="submit" className="w-fit" variant={"link"}>
              .
            </Button>
          </form>
        </section>
      </PgContent>
    </Pg>
  );
}

async function getDevTeams() {
  "use server";
  return await db.query.devTeams.findMany({
    orderBy: (devTeams, { asc }) => [asc(devTeams.name)],
    with: {
      projects: {
        orderBy: (projects, { asc }) => [asc(projects.id)],
        with: {
          sprints: {
            orderBy: (sprints, { asc }) => [asc(sprints.createdAt)],
          },
        },
      },
    },
  });
}

async function revalidateDevTeams() {
  "use server";
  revalidatePath("/");
  redirect("/");
}

async function DevTeams() {
  const devTeams = await getDevTeams();

  if (!devTeams) {
    return <div>Erro ao carregar times de desenvolvimento</div>;
  }

  if (devTeams.length === 0) {
    return <div>Nenhum time de desenvolvimento encontrado.</div>;
  }

  if (devTeams.length > 0) {
    return (
      <section className="space-y-8">
        <div className="flex gap-6 text-center pt-6">
          <div className="min-w-48 font-semibold"></div>
          <div className="w-full max-w-sm font-semibold">Projeto Atual</div>
          <div className="w-full max-w-sm font-semibold">Próximo</div>
        </div>

        {devTeams.map((devTeam) => (
          <div key={devTeam.name} className="flex gap-6">
            <Link
              href={`/dev-teams/${devTeam.id}`}
              className="flex flex-col items-center justify-center min-w-48 max-w-48"
            >
              <Image
                src={devTeam.imageUrl ?? ""}
                alt={devTeam.name ?? ""}
                width={100}
                height={100}
                className="rounded-full w-20 h-20"
              />
              <h1 className="font-semibold mt-2">{devTeam.name}</h1>
              <p className="leading-4 text-sm text-muted-foreground">
                {devTeam.description ?? ""}
              </p>
            </Link>

            <div className="flex gap-6">
              {devTeam.projects &&
                devTeam.projects.map((project, index) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={cn(
                      "block p-3 rounded-md min-w-sm max-w-sm",
                      index > 1
                        ? "bg-slate-100 dark:bg-slate-700"
                        : getColorClassName(project.color)
                    )}
                  >
                    <h2 className="font-medium">{project.name}</h2>
                    <p className="text-muted-foreground">
                      {project.description}
                    </p>

                    <div>
                      {project.sprints &&
                        project.sprints.map((sprint, index) => (
                          <div key={index}>
                            <small className="text-xs">{sprint.name}</small>
                            <Progress value={sprint.progress} />
                            <div className="flex justify-between">
                              <small>
                                {new Date(
                                  sprint.startDate ?? ""
                                ).toLocaleDateString("pt-br")}
                              </small>
                              <small>
                                {new Date(
                                  sprint.finishDate ?? ""
                                ).toLocaleDateString("pt-br")}
                              </small>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </section>
    );
  }

  return <div>Erro desconhecido</div>;
}

async function getProjectsWithNoTeam() {
  "use server";
  return await db.query.projects.findMany({
    where: (projects, { isNull }) => isNull(projects.responsibleTeamId),
    with: {
      sprints: {
        orderBy: (sprints, { asc }) => [asc(sprints.createdAt)],
      },
    },
  });
}

async function ProjectsWithNoTeam() {
  const projectsWithNoTeam = await getProjectsWithNoTeam();

  if (!projectsWithNoTeam) {
    return (
      <div className="text-muted-foreground">Erro ao carregar projetos</div>
    );
  }

  if (projectsWithNoTeam.length === 0) {
    return (
      <div className="text-muted-foreground">Nenhum projeto encontrado</div>
    );
  }

  if (projectsWithNoTeam.length > 0) {
    return (
      <div className="flex gap-6">
        {projectsWithNoTeam.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  return <div>Erro desconhecido</div>;
}

function ProjectCard({
  project,
}: {
  project: Awaited<ReturnType<typeof getProjectsWithNoTeam>>[number];
}) {
  return (
    <Link
      key={project.id}
      href={`/projects/${project.id}`}
      className={cn("block p-3 rounded-md min-w-sm max-w-sm", project.color)}
    >
      <div className="font-medium">{project.name}</div>
      <p className="text-muted-foreground">{project.description}</p>

      <div>
        {project.sprints &&
          project.sprints.map((sprint, index) => (
            <div key={index}>
              <small className="text-xs">{sprint.name}</small>
              <Progress value={sprint.progress} />
              <div className="flex justify-between">
                <small>
                  {new Date(sprint.startDate ?? "").toLocaleDateString("pt-br")}
                </small>
                <small>
                  {new Date(sprint.finishDate ?? "").toLocaleDateString(
                    "pt-br"
                  )}
                </small>
              </div>
            </div>
          ))}
      </div>
    </Link>
  );
}
