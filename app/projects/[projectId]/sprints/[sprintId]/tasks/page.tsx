import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import Link from "next/link";
import { ButtonClose } from "@/components/custom/button-close";
import { ClientOnly } from "@/components/custom/client-only";
import { getTasks } from "./server-actions";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Kanban from "./kanban";

export const metadata = {
  title: "Tarefas",
  description:
    "Acompanhe as tarefas do sprint. Você pode reordenar as tarefas arrastando e soltando.",
};

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
    <Pg className="max-w-[1440px]">
      <ButtonClose />

      <PgHeader className="relative">
        <Link
          href={`/projects/${projectId}/sprints/${sprintId}/tasks/create`}
          className="flex items-center gap-2 absolute top-4 right-4"
        >
          <Button variant={"secondary"}>
            <PlusIcon />
            <span>Criar nova tarefa</span>
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
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/projects/${projectId}`}>Projeto</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/projects/${projectId}/sprints`}>Sprints</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <PgTitle>{metadata.title}</PgTitle>
        <PgDescription>{metadata.description}</PgDescription>
      </PgHeader>

      <PgContent className="mt-4">
        <Tasks sprintId={sprintId} />
      </PgContent>
    </Pg>
  );
}

async function Tasks({ sprintId }: { sprintId: string }) {
  const tasks = await getTasks(sprintId);

  if (!tasks) {
    return <div>Erro ao carregar tarefas</div>;
  }

  if (tasks.length === 0) {
    return <div>Nenhuma tarefa encontrada</div>;
  }

  if (tasks.length > 0) {
    return (
      <ClientOnly fallback={<div>Carregando...</div>}>
        <Kanban tasks={tasks} />
      </ClientOnly>
    );
  }

  return <div>Erro desconhecido</div>;
}
