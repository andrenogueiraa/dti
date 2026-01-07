"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getColorClassName } from "@/enums/colors";
import { COMPLEXITY_LEVELS } from "@/enums/complexity-levels";
import { PROJECT_STATUSES } from "@/enums/project-statuses";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type DbProject = {
  id: string;
  name: string | null;
  description: string | null;
  color: string;
  status: string;
  complexity: string | null;
  socialImpact: number | null;
  semarhImpact: number | null;
  estimatedWeeks: number | null;
  createdAt: Date | null;
  responsibleTeam: {
    id: string;
    name: string | null;
  } | null;
  sprints: {
    id: string;
    progress: number | null;
  }[];
};

const columns = [
  { id: "AI", title: "Aguardando Início", color: "bg-slate-100" },
  { id: "EA", title: "Em andamento", color: "bg-blue-50" },
  { id: "CO", title: "Concluído", color: "bg-green-50" },
  { id: "CA_SU", title: "Cancelado/Suspenso", color: "bg-red-50" },
] as const;

interface Project {
  id: string;
  name: string | null;
  description: string | null;
  color: string;
  status: string;
  complexity: string | null;
  socialImpact: number | null;
  semarhImpact: number | null;
  estimatedWeeks: number | null;
  responsibleTeam: {
    id: string;
    name: string | null;
  } | null;
  sprints: {
    id: string;
    progress: number | null;
  }[];
}

function convertDbProjectToProject(dbProject: DbProject): Project {
  return {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description,
    color: dbProject.color,
    status: dbProject.status,
    complexity: dbProject.complexity,
    socialImpact: dbProject.socialImpact,
    semarhImpact: dbProject.semarhImpact,
    estimatedWeeks: dbProject.estimatedWeeks,
    responsibleTeam: dbProject.responsibleTeam,
    sprints: dbProject.sprints,
  };
}

function getStatusLabel(status: string): string {
  if (status === "CA" || status === "SU") {
    return status === "CA" ? "Cancelado" : "Suspenso";
  }
  const statusObj = PROJECT_STATUSES.find((s) => s.value === status);
  return statusObj?.label || status;
}

function getComplexityLabel(value: string | null): string {
  if (!value) return "";
  const level = COMPLEXITY_LEVELS.find((l) => l.value === value);
  return level?.label || value;
}

function calculateAverageProgress(sprints: { progress: number | null }[]): number {
  if (sprints.length === 0) return 0;
  const total = sprints.reduce((sum, sprint) => sum + (sprint.progress || 0), 0);
  return Math.round(total / sprints.length);
}

function ProjectCard({ project }: { project: Project }) {
  const progress = calculateAverageProgress(project.sprints);
  const complexityLabel = getComplexityLabel(project.complexity);
  const statusLabel = getStatusLabel(project.status);

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow w-full max-w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-tight line-clamp-2 flex-1 min-w-0">
              {project.name || "Sem título"}
            </h3>
            <div
              className={cn(
                "w-3 h-3 rounded-full flex-shrink-0 mt-1",
                getColorClassName(project.color)
              )}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 break-words">
              {project.description}
            </p>
          )}

          {project.sprints.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {project.responsibleTeam && (
              <Badge variant="outline" className="text-xs">
                {project.responsibleTeam.name}
              </Badge>
            )}
            {complexityLabel && (
              <Badge variant="secondary" className="text-xs">
                {complexityLabel}
              </Badge>
            )}
            {(project.status === "CA" || project.status === "SU") && (
              <Badge variant="destructive" className="text-xs">
                {statusLabel}
              </Badge>
            )}
          </div>

          {(project.socialImpact !== null || project.semarhImpact !== null) && (
            <div className="flex gap-2 text-xs text-muted-foreground pt-1">
              {project.socialImpact !== null && <span>Social: {project.socialImpact}/10</span>}
              {project.semarhImpact !== null && <span>SEMARH: {project.semarhImpact}/10</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function Column({
  column,
  projects,
}: {
  column: { id: string; title: string; color: string };
  projects: Project[];
}) {
  return (
    <div className="flex flex-col w-full flex-shrink-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {column.title}
          <Badge
            variant="secondary"
            className="rounded-full transition-all duration-200"
          >
            {projects.length}
          </Badge>
        </h3>
      </div>

      <div
        className={cn(
          "rounded-lg p-3 transition-all duration-300 ease-in-out overflow-y-auto",
          column.color
        )}
        style={{
          maxHeight: "calc(100vh - 280px)",
          minHeight: "200px",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          scrollbarWidth: "thin",
          scrollbarColor: "rgb(203 213 225) transparent",
        }}
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

export default function Kanban({ projects: initialProjects }: { projects: DbProject[] }) {
  const projects = initialProjects.map(convertDbProjectToProject);

  const getProjectsForColumn = (columnId: string): Project[] => {
    if (columnId === "CA_SU") {
      return projects.filter((p) => p.status === "CA" || p.status === "SU");
    }
    return projects.filter((p) => p.status === columnId);
  };

  return (
    <main className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full w-full">
        {columns.map((column) => {
          const columnProjects = getProjectsForColumn(column.id);

          return (
            <Column
              key={column.id}
              column={column}
              projects={columnProjects}
            />
          );
        })}
      </div>
    </main>
  );
}
