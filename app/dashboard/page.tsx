"use cache";

import { Suspense } from "react";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { cacheLife } from "next/cache";
import { getAllProjects } from "./server-actions";
import Kanban from "./kanban";

const title = "Todos os Projetos";
const description =
  "Visualização Kanban de todos os projetos organizados por status";

export const metadata = {
  title,
  description,
};

export default async function DashboardPage() {
  cacheLife("max");

  return (
    <Pg className="max-w-full relative min-h-screen">
      <PgHeader>
        <PgTitle>{title}</PgTitle>
        <PgDescription>{description}</PgDescription>
      </PgHeader>

      <PgContent>
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
