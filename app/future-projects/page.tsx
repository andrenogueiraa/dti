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
import { getFutureProjects } from "./server-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COMPLEXITY_LEVELS } from "@/enums/complexity-levels";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Projetos Futuros",
  description: "Visualização e administração de projetos futuros",
};

export default async function FutureProjectsPage() {
  cacheLife("max");
  return (
    <Bg>
      <Pg className="max-w-full relative">
        <ButtonClose href="/" />
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

  const getComplexityLabel = (value: string | null) => {
    if (!value) return "-";
    const level = COMPLEXITY_LEVELS.find((l) => l.value === value);
    return level?.label || value;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Complexidade</TableHead>
          <TableHead>Impacto Social</TableHead>
          <TableHead>Impacto SEMARH</TableHead>
          <TableHead>Tempo Estimado</TableHead>
          <TableHead>Equipe Responsável</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {getComplexityLabel(project.complexity)}
              </Badge>
            </TableCell>
            <TableCell>{project.socialImpact ?? "-"}</TableCell>
            <TableCell>{project.semarhImpact ?? "-"}</TableCell>
            <TableCell>
              {project.estimatedWeeks
                ? `${project.estimatedWeeks} semana${project.estimatedWeeks > 1 ? "s" : ""}`
                : "-"}
            </TableCell>
            <TableCell>
              {project.responsibleTeam?.name ?? "-"}
            </TableCell>
            <TableCell>
              <Link href={`/projects/${project.id}`}>
                <Button variant="link" size="sm">
                  Ver detalhes
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

