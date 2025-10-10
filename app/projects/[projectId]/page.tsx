import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";

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
import Image from "next/image";
import { Suspense } from "react";
import LoadingPage from "@/components/custom/loading-page";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
    <Suspense fallback={<LoadingPage />}>
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
      <PgHeader className="relative">
        <Link
          href={`/projects/${projectId}/sprints/create`}
          className="absolute top-0 right-4"
        >
          <Button className="flex items-center gap-2" variant="secondary">
            <PlusIcon />
            Criar nova Sprint
          </Button>
        </Link>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dev-teams">Equipes</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{project.name}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PgTitle className="max-w-xl">{project.name}</PgTitle>
        <PgDescription>{project.description}</PgDescription>
      </PgHeader>

      <PgContent className="space-y-6">
        {project.sprints.map((sprint) => (
          <div key={sprint.id}>
            <div>
              <Icon
                icon="fluent:arrow-sprint-16-filled"
                className="text-primary/40 w-12 h-12"
              />
              <span className="font-semibold">{sprint.name}: </span>
              <span className="text-muted-foreground">
                {sprint.description}
              </span>

              <Progress value={sprint.progress} className="mt-1" />

              <div className="flex justify-between text-muted-foreground mt-1">
                <small>{sprint.startDate?.toLocaleDateString()}</small>
                <small>{sprint.finishDate?.toLocaleDateString()}</small>
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

                <Link
                  href={`/projects/${projectId}/sprints/${sprint.id}/atas`}
                  className="flex items-center gap-2 rounded bg-border/30 px-2 py-1"
                >
                  <Icon
                    icon="tabler:file-text"
                    className="w-7 h-7 cursor-pointer text-primary"
                  />
                  <span className="text-xs">Retrospective</span>
                </Link>

                <Dialog>
                  <DialogTrigger className="flex items-center gap-2 rounded bg-border/30 px-2 py-1">
                    <Icon
                      icon="solar:document-text-bold"
                      className="w-7 h-7 cursor-pointer text-primary"
                    />
                    <span className="text-xs">Review</span>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-prose">
                    <DialogHeader hidden>
                      <DialogTitle>{sprint.name}</DialogTitle>
                      <DialogDescription>
                        {sprint.description}
                      </DialogDescription>
                    </DialogHeader>
                    <Ata />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ))}
      </PgContent>
    </Pg>
  );
}

function Ata() {
  return (
    <main className="space-y-4 prose">
      <h2>Ata da Reunião</h2>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laborum
        expedita explicabo nostrum nesciunt quasi alias nam quidem optio
        repellendus voluptatem.
      </p>

      <h3>Novos Requisitos</h3>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laborum
        expedita explicabo nostrum nesciunt quasi alias nam quidem optio
        repellendus voluptatem.
      </p>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laborum
        expedita explicabo nostrum nesciunt quasi alias nam quidem optio
        repellendus voluptatem.
      </p>

      <h3>Imagens</h3>
      <Image
        src="/reuniao.jpeg"
        alt="Evidências"
        width={720}
        height={480}
        className="rounded"
      />

      <h3>Assinaturas</h3>
      <ul>
        <li>
          Assinado digitalmente por André Nogueira em{" "}
          {new Date().toLocaleDateString("pt-br")}
        </li>
        <li>
          Assinado digitalmente por Rubens Carvalho em{" "}
          {new Date().toLocaleDateString("pt-br")}
        </li>
        <li>
          Assinado digitalmente por Anna Ester em{" "}
          {new Date().toLocaleDateString("pt-br")}
        </li>
      </ul>
    </main>
  );
}
