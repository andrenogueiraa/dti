"use cache";

import { Suspense } from "react";
import { Bg } from "@/components/custom/bg";
import { ButtonClose } from "@/components/custom/button-close";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
  PgAction,
} from "@/components/ui/pg";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { getAllProjects } from "./server-actions";
import Kanban from "./kanban";

export const metadata = {
  title: "Dashboard de Projetos",
  description: "Visualização Kanban de todos os projetos",
};

export default async function DashboardPage() {
  cacheLife("max");
  return (
    <Bg>
      <Pg className="max-w-full relative">
        <ButtonClose href="/" />
        <PgHeader>
          <PgTitle>Dashboard de Projetos</PgTitle>
          <PgDescription>
            Visualização Kanban de todos os projetos organizados por status
          </PgDescription>
          <PgAction>
            <Link href="/future-projects/add">
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Adicionar Projeto
              </Button>
            </Link>
          </PgAction>
        </PgHeader>

        <PgContent className="p-8">
          <Suspense
            fallback={
              <ContainerCenter>
                <LoadingSpinner />
              </ContainerCenter>
            }
          >
            <ProjectsKanban />
          </Suspense>
        </PgContent>
      </Pg>
    </Bg>
  );
}

async function ProjectsKanban() {
  const projects = await getAllProjects();

  if (!projects || projects.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-8">
        Nenhum projeto encontrado.
      </div>
    );
  }

  return <Kanban projects={projects} />;
}

