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
  arrayMove,
} from "@dnd-kit/sortable";
import {
  updateTaskStatusAndOrder,
  bulkUpdateTaskOrders,
} from "./server-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Priority = "low" | "medium" | "high" | "urgent";

type DbTask = {
  id: string;
  name: string | null;
  description: string | null;
  status: string;
  urgency: string | null;
  tags: string[] | null;
  sprintId: string;
  responsibleUserId: string | null;
  isActive: boolean | null;
  isDeleted: boolean | null;
  order: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  responsibleUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

const columns = [
  { id: "NI", title: "Não iniciada", color: "bg-slate-100" },
  { id: "EP", title: "Em progresso", color: "bg-blue-50" },
  { id: "ER", title: "Em revisão", color: "bg-amber-50" },
  { id: "C", title: "Concluída", color: "bg-green-50" },
] as const;

const priorityColors: Record<
  Priority,
  "destructive" | "secondary" | "outline" | "default"
> = {
  urgent: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

const priorityLabels: Record<Priority, string> = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

interface Task {
  id: string;
  name: string | null;
  description: string | null;
  status: string;
  urgency: string | null;
  tags: string[] | null;
  order: number | null;
  responsibleUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

function convertDbTaskToTask(dbTask: DbTask): Task {
  return {
    id: dbTask.id,
    name: dbTask.name,
    description: dbTask.description,
    status: dbTask.status,
    urgency: dbTask.urgency,
    tags: dbTask.tags,
    order: dbTask.order,
    responsibleUser: dbTask.responsibleUser,
  };
}

function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const priority = task.urgency as Priority | null;
  const userName =
    task.responsibleUser?.name ||
    task.responsibleUser?.email ||
    "Sem responsável";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card className="gap-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-tight">
            {task.name || "Sem título"}
          </CardTitle>
          {priority && (
            <Badge variant={priorityColors[priority]} className="text-xs">
              {priorityLabels[priority]}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            {initials}
          </div>
          <span className="text-xs text-muted-foreground">{userName}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function DroppableColumn({
  column,
  tasks,
}: {
  column: { id: string; title: string; color: string };
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  return (
    <div className="flex flex-col w-full flex-shrink-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {column.title}
          <Badge
            variant="secondary"
            className="rounded-full transition-all duration-200"
          >
            {tasks.length}
          </Badge>
        </h3>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`kanban-column-scroll rounded-lg p-3 h-[calc(100vh-16rem)] overflow-y-auto transition-all duration-300 ease-in-out ${
            column.color
          } ${isOver ? "ring-2 ring-primary ring-offset-2" : ""}`}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            scrollbarWidth: "thin",
            scrollbarColor: "rgb(203 213 225) transparent",
          }}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function Kanban({ tasks: initialTasks }: { tasks: DbTask[] }) {
  const [tasks, setTasks] = useState<Task[]>(
    initialTasks.map(convertDbTaskToTask)
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
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
    const task = active.data.current?.task;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = () => {
    // Visual feedback only - don't update state here
    // All updates happen in handleDragEnd
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) {
      setActiveTask(null);
      return;
    }

    const activeIndex = tasks.findIndex((t) => t.id === activeId);
    const overIndex = tasks.findIndex((t) => t.id === overId);

    // Check if dropped on a column
    const overColumn = columns.find((col) => col.id === overId);
    const overTask = tasks.find((t) => t.id === overId);

    if (overColumn) {
      // Dropped on a column header
      const newStatus = overColumn.id;
      if (activeTask.status !== newStatus) {
        const columnTasks = tasks.filter((t) => t.status === newStatus);
        const newOrder = columnTasks.length;

        // Optimistic update
        const updatedTasks = tasks.map((task) =>
          task.id === activeId
            ? { ...task, status: newStatus, order: newOrder }
            : task
        );
        setTasks(updatedTasks);

        // Auto-save to database
        try {
          await updateTaskStatusAndOrder(activeId, newStatus, newOrder);
          toast.success("Atualizado!");
          router.refresh();
        } catch (error) {
          setTasks(tasks); // Revert on error
          toast.error("Erro ao atualizar");
          console.error("Failed to update:", error);
        }
      }
    } else if (overTask) {
      // Dropped on another task
      const isSameColumn = activeTask.status === overTask.status;

      // If different column or different index
      if (!isSameColumn || activeIndex !== overIndex) {
        const movedTasks = arrayMove(tasks, activeIndex, overIndex);

        if (isSameColumn) {
          // Reordering within same column
          // Update order for all tasks in this column
          const columnTasks = movedTasks.filter(
            (t) => t.status === activeTask.status
          );
          const updates = columnTasks.map((task, index) => ({
            ...task,
            order: index,
          }));

          // Optimistic update
          const updatedTasks = movedTasks.map((task) => {
            const update = updates.find((u) => u.id === task.id);
            return update ? { ...task, order: update.order } : task;
          });
          setTasks(updatedTasks);

          // Auto-save to database
          try {
            await bulkUpdateTaskOrders(
              updates.map((u) => ({ id: u.id, order: u.order }))
            );
            toast.success("Atualizado!");
            router.refresh();
          } catch (error) {
            setTasks(tasks); // Revert on error
            toast.error("Erro ao atualizar");
            console.error("Failed to update order:", error);
          }
        } else {
          // Moving between columns
          const newStatus = overTask.status;
          const columnTasks = movedTasks.filter((t) => t.status === newStatus);
          const newOrder = columnTasks.findIndex((t) => t.id === activeId);

          // Optimistic update
          const updatedTasks = movedTasks.map((task) =>
            task.id === activeId
              ? { ...task, status: newStatus, order: newOrder }
              : task
          );
          setTasks(updatedTasks);

          // Auto-save to database
          try {
            await updateTaskStatusAndOrder(activeId, newStatus, newOrder);

            // Also update order for other tasks in the new column
            const newColumnTasks = updatedTasks.filter(
              (t) => t.status === newStatus
            );
            await bulkUpdateTaskOrders(
              newColumnTasks.map((task, index) => ({
                id: task.id,
                order: index,
              }))
            );

            toast.success("Atualizado!");
            router.refresh();
          } catch (error) {
            setTasks(tasks); // Revert on error
            toast.error("Erro ao atualizar");
            console.error("Failed to update:", error);
          }
        }
      }
    }

    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[snapCenterToCursor]}
    >
      <main className="h-full">
        <div className="grid grid-cols-4 gap-4 h-full min-w-max">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.id
            );

            return (
              <DroppableColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
              />
            );
          })}
        </div>
      </main>

      <DragOverlay>
        {activeTask ? (
          <div style={{ cursor: "grabbing" }}>
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
