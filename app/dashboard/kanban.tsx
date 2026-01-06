"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { updateProjectStatus } from "./server-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

function SortableProjectCard({ project }: { project: Project }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    data: { project },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ProjectCard project={project} />
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const progress = calculateAverageProgress(project.sprints);
  const complexityLabel = getComplexityLabel(project.complexity);
  const statusLabel = getStatusLabel(project.status);

  return (
    <Card className="gap-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow w-full max-w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/projects/${project.id}`}
            className="text-sm font-medium leading-tight line-clamp-2 flex-1 min-w-0 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {project.name || "Sem título"}
          </Link>
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

        {project.socialImpact && project.semarhImpact && (
          <div className="flex gap-2 text-xs text-muted-foreground pt-1">
            <span>Social: {project.socialImpact}/10</span>
            <span>SEMARH: {project.semarhImpact}/10</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DroppableColumn({
  column,
  projects,
}: {
  column: { id: string; title: string; color: string };
  projects: Project[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const projectIds = useMemo(() => projects.map((p) => p.id), [projects]);

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

      <SortableContext
        items={projectIds}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            "kanban-column-scroll rounded-lg p-3 min-h-[calc(100vh-16rem)] h-full transition-all duration-300 ease-in-out",
            column.color,
            isOver && "ring-2 ring-primary ring-offset-2"
          )}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            scrollbarWidth: "thin",
            scrollbarColor: "rgb(203 213 225) transparent",
          }}
        >
          {projects.map((project) => (
            <SortableProjectCard key={project.id} project={project} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function Kanban({ projects: initialProjects }: { projects: DbProject[] }) {
  const [projects, setProjects] = useState<Project[]>(
    initialProjects.map(convertDbProjectToProject)
  );
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = active.data.current?.project;
    if (project) {
      setActiveProject(project);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveProject(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeProject = projects.find((p) => p.id === activeId);
    if (!activeProject) {
      setActiveProject(null);
      return;
    }

    const overColumn = columns.find((col) => col.id === overId);

    if (overColumn) {
      let newStatus: string;
      
      if (overColumn.id === "CA_SU") {
        if (activeProject.status === "CA" || activeProject.status === "SU") {
          setActiveProject(null);
          return;
        }
        newStatus = "CA";
      } else {
        newStatus = overColumn.id;
      }

      if (activeProject.status !== newStatus) {
        const updatedProjects = projects.map((project) =>
          project.id === activeId ? { ...project, status: newStatus } : project
        );
        setProjects(updatedProjects);

        try {
          await updateProjectStatus(activeId, newStatus);
          toast.success("Status atualizado!");
          router.refresh();
        } catch (error) {
          setProjects(projects);
          toast.error("Erro ao atualizar status");
          console.error("Failed to update:", error);
        }
      }
    }

    setActiveProject(null);
  };

  const getProjectsForColumn = (columnId: string): Project[] => {
    if (columnId === "CA_SU") {
      return projects.filter((p) => p.status === "CA" || p.status === "SU");
    }
    return projects.filter((p) => p.status === columnId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[snapCenterToCursor]}
    >
      <main className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full w-full">
          {columns.map((column) => {
            const columnProjects = getProjectsForColumn(column.id);

            return (
              <DroppableColumn
                key={column.id}
                column={column}
                projects={columnProjects}
              />
            );
          })}
        </div>
      </main>

      <DragOverlay>
        {activeProject ? (
          <div style={{ cursor: "grabbing" }}>
            <ProjectCard project={activeProject} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

