"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
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
  bulkUpdateTaskOrders,
  bulkUpdateTaskStatusAndOrders,
  updateTask,
  getUsers,
} from "./server-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TASK_PRIORITIES } from "@/enums/task-priorities";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

// --- Schema ---

const editTaskSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  urgency: z.string().optional(),
  responsibleUserId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type EditTaskFormData = z.infer<typeof editTaskSchema>;

// --- Types ---

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
  responsibleUserId: string | null;
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
    responsibleUserId: dbTask.responsibleUserId,
    responsibleUser: dbTask.responsibleUser,
  };
}

// --- TagsInput ---

function TagsInput({
  value,
  onChange,
}: {
  value: string[] | undefined;
  onChange: (tags: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState(() => value?.join(", ") || "");

  useEffect(() => {
    setInputValue(value?.join(", ") || "");
  }, [value]);

  return (
    <Input
      placeholder="Digite as tags separadas por vírgula"
      value={inputValue}
      onChange={(e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        const tags = newValue
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        onChange(tags);
      }}
    />
  );
}

// --- EditTaskDialog ---

function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
  projectId,
  sprintId,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (updatedTask: Task) => void;
  projectId: string;
  sprintId: string;
}) {
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: open,
  });

  const form = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      name: "",
      description: "",
      urgency: undefined,
      responsibleUserId: undefined,
      tags: [],
    },
  });

  useEffect(() => {
    if (task && open) {
      form.reset({
        name: task.name || "",
        description: task.description || "",
        urgency: task.urgency || undefined,
        responsibleUserId: task.responsibleUserId || undefined,
        tags: task.tags || [],
      });
    }
  }, [task, open, form]);

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess() {
      toast.success("Tarefa atualizada!");
      onOpenChange(false);
    },
    onError() {
      toast.error("Erro ao atualizar tarefa");
    },
  });

  const onSubmit = (data: EditTaskFormData) => {
    if (!task) return;

    onTaskUpdated({
      ...task,
      name: data.name,
      description: data.description,
      urgency: data.urgency || null,
      responsibleUserId: data.responsibleUserId || null,
      tags: data.tags || null,
      responsibleUser: data.responsibleUserId
        ? users?.find((u) => u.id === data.responsibleUserId)
          ? {
              id: data.responsibleUserId,
              name:
                users.find((u) => u.id === data.responsibleUserId)?.name ??
                null,
              email:
                users.find((u) => u.id === data.responsibleUserId)?.email ?? "",
            }
          : task.responsibleUser
        : null,
    });

    updateTaskMutation.mutate({
      taskId: task.id,
      data,
      projectId,
      sprintId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar tarefa</DialogTitle>
          <DialogDescription>
            Atualize os dados da tarefa abaixo.
          </DialogDescription>
        </DialogHeader>

        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              Carregando...
            </span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_PRIORITIES.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsibleUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um responsável" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagsInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>
                      Separe as tags com vírgulas (ex: bug, frontend, urgente)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={updateTaskMutation.isPending}
              >
                {updateTaskMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Card Components ---

function SortableTaskCard({
  task,
  onClickTask,
}: {
  task: Task;
  onClickTask: (task: Task) => void;
}) {
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClickTask(task)}
    >
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
    <Card className="gap-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow w-full max-w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-tight line-clamp-2 flex-1 min-w-0">
            {task.name || "Sem título"}
          </CardTitle>
          {priority && (
            <Badge
              variant={priorityColors[priority]}
              className="text-xs flex-shrink-0"
            >
              {priorityLabels[priority]}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 break-words">
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

// --- Column Component ---

function DroppableColumn({
  column,
  tasks,
  onClickTask,
}: {
  column: { id: string; title: string; color: string };
  tasks: Task[];
  onClickTask: (task: Task) => void;
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
          className={`kanban-column-scroll rounded-lg p-3 min-h-[calc(100vh-16rem)] h-full transition-all duration-300 ease-in-out ${
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
            <SortableTaskCard
              key={task.id}
              task={task}
              onClickTask={onClickTask}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// --- Custom collision detection ---
// pointerWithin detects when the cursor is physically inside a droppable area,
// solving the issue where middle columns (EP/ER) lose the distance competition
// against edge columns when using closestCorners.
const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  return rectIntersection(args);
};

// --- Main Kanban ---

export default function Kanban({
  tasks: initialTasks,
  projectId,
  sprintId,
}: {
  tasks: DbTask[];
  projectId: string;
  sprintId: string;
}) {
  const [tasks, setTasks] = useState<Task[]>(
    initialTasks.map(convertDbTaskToTask)
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleClickTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    router.refresh();
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = () => {};

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const draggedTask = tasks.find((t) => t.id === activeId);
    if (!draggedTask) {
      setActiveTask(null);
      return;
    }

    const overColumn = columns.find((col) => col.id === overId);
    const overTask = tasks.find((t) => t.id === overId);

    // Save current state for rollback
    const previousTasks = tasks;

    if (overColumn) {
      // --- DROPPED ON COLUMN HEADER (cross-column) ---
      const newStatus = overColumn.id;
      if (draggedTask.status === newStatus) {
        setActiveTask(null);
        return;
      }

      // 1. Remove from source column and re-index
      const sourceColumnTasks = tasks
        .filter((t) => t.status === draggedTask.status && t.id !== activeId)
        .map((t, i) => ({ ...t, order: i }));

      // 2. Append to destination column and re-index
      const destColumnTasks = tasks.filter((t) => t.status === newStatus);
      const movedTask = {
        ...draggedTask,
        status: newStatus,
        order: destColumnTasks.length,
      };
      const newDestColumnTasks = [...destColumnTasks, movedTask].map(
        (t, i) => ({ ...t, order: i })
      );

      // 3. Optimistic update
      const updatedTasks = tasks.map((t) => {
        const sourceUpdate = sourceColumnTasks.find((s) => s.id === t.id);
        if (sourceUpdate) return sourceUpdate;
        const destUpdate = newDestColumnTasks.find((d) => d.id === t.id);
        if (destUpdate) return destUpdate;
        return t;
      });
      setTasks(updatedTasks);

      // 4. Persist: single bulk call for both columns
      try {
        const dbUpdates = [
          ...sourceColumnTasks.map((t) => ({ id: t.id, order: t.order })),
          ...newDestColumnTasks.map((t) => ({
            id: t.id,
            order: t.order,
            status: newStatus,
          })),
        ];
        await bulkUpdateTaskStatusAndOrders(dbUpdates);
        toast.success("Atualizado!");
        router.refresh();
      } catch (error) {
        setTasks(previousTasks);
        toast.error("Erro ao atualizar");
        console.error("Failed to update:", error);
      }
    } else if (overTask) {
      const isSameColumn = draggedTask.status === overTask.status;

      if (isSameColumn) {
        // --- REORDER WITHIN SAME COLUMN ---
        if (activeId === overId) {
          setActiveTask(null);
          return;
        }

        const columnTasks = tasks.filter(
          (t) => t.status === draggedTask.status
        );
        const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
        const newIndex = columnTasks.findIndex((t) => t.id === overId);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
          setActiveTask(null);
          return;
        }

        // arrayMove on the COLUMN array only
        const reordered = arrayMove(columnTasks, oldIndex, newIndex).map(
          (t, i) => ({ ...t, order: i })
        );

        // Optimistic update
        const updatedTasks = tasks.map((t) => {
          const update = reordered.find((r) => r.id === t.id);
          return update || t;
        });
        setTasks(updatedTasks);

        // Persist
        try {
          await bulkUpdateTaskOrders(
            reordered.map((t) => ({ id: t.id, order: t.order }))
          );
          toast.success("Atualizado!");
          router.refresh();
        } catch (error) {
          setTasks(previousTasks);
          toast.error("Erro ao atualizar");
          console.error("Failed to update order:", error);
        }
      } else {
        // --- CROSS-COLUMN DROP ON A SPECIFIC TASK ---
        const newStatus = overTask.status;

        // 1. Remove from source column, re-index
        const sourceColumnTasks = tasks
          .filter((t) => t.status === draggedTask.status && t.id !== activeId)
          .map((t, i) => ({ ...t, order: i }));

        // 2. Insert at overTask's position in destination column
        const destColumnTasks = tasks.filter((t) => t.status === newStatus);
        const insertIndex = destColumnTasks.findIndex(
          (t) => t.id === overTask.id
        );
        const movedTask = { ...draggedTask, status: newStatus };
        const newDestColumnTasks = [
          ...destColumnTasks.slice(0, insertIndex),
          movedTask,
          ...destColumnTasks.slice(insertIndex),
        ].map((t, i) => ({ ...t, order: i }));

        // 3. Optimistic update
        const updatedTasks = tasks.map((t) => {
          const sourceUpdate = sourceColumnTasks.find((s) => s.id === t.id);
          if (sourceUpdate) return sourceUpdate;
          const destUpdate = newDestColumnTasks.find((d) => d.id === t.id);
          if (destUpdate) return destUpdate;
          return t;
        });
        setTasks(updatedTasks);

        // 4. Persist: single bulk call for both columns
        try {
          const dbUpdates = [
            ...sourceColumnTasks.map((t) => ({ id: t.id, order: t.order })),
            ...newDestColumnTasks.map((t) => ({
              id: t.id,
              order: t.order,
              status: newStatus,
            })),
          ];
          await bulkUpdateTaskStatusAndOrders(dbUpdates);
          toast.success("Atualizado!");
          router.refresh();
        } catch (error) {
          setTasks(previousTasks);
          toast.error("Erro ao atualizar");
          console.error("Failed to update:", error);
        }
      }
    }

    setActiveTask(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={kanbanCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[snapCenterToCursor]}
      >
        <main className="h-full">
          <div className="grid grid-cols-4 gap-4 h-full w-full">
            {columns.map((column) => {
              const columnTasks = tasks.filter(
                (task) => task.status === column.id
              );

              return (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onClickTask={handleClickTask}
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

      <EditTaskDialog
        task={editingTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onTaskUpdated={handleTaskUpdated}
        projectId={projectId}
        sprintId={sprintId}
      />
    </>
  );
}
