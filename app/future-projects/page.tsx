"use cache";

import { Suspense } from "react";
import { Bg } from "@/components/custom/bg";
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
import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import { getFutureProjects } from "./server-actions";
import { FutureProjectsClient } from "./client";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Projetos Futuros",
  description: "Visualização e administração de projetos futuros",
};

export default async function FutureProjectsPage() {
  cacheLife("max");
  return (
    <Bg>
      <Pg className="max-w-full relative">  
        <PgHeader>
          <PgTitle>Projetos Futuros</PgTitle>
          <PgDescription>
            Visualização e administração de projetos não iniciados
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

        <PgContent>
          <Suspense
            fallback={
              <ContainerCenter>
                <LoadingSpinner />
              </ContainerCenter>
            }
          >
            <FutureProjectsTable />
          </Suspense>
        </PgContent>
      </Pg>
    </Bg>
  );
}

async function FutureProjectsTable() {
  const projects = await getFutureProjects();

  if (!projects || projects.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-8">
        Nenhum projeto futuro encontrado.
      </div>
    );
  }

  return <FutureProjectsClient projects={projects} />;
}

