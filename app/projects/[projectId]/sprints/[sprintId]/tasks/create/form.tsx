"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createTask, getUsers } from "./server-actions";
import { useRouter } from "next/navigation";
import { TASK_PRIORITIES } from "@/shared-data/task-priorities";

const createTaskFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  urgency: z.string().optional(),
  responsibleUserId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateTaskFormSchema = z.infer<typeof createTaskFormSchema>;

export default function CreateTaskForm({
  projectId,
  sprintId,
}: {
  projectId: string;
  sprintId: string;
}) {
  const router = useRouter();

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const form = useForm<CreateTaskFormSchema>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      name: "",
      description: "",
      urgency: undefined,
      responsibleUserId: undefined,
      tags: [],
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess() {
      router.push(`/projects/${projectId}/sprints/${sprintId}/tasks`);
    },
  });

  const onSubmit = (data: CreateTaskFormSchema) => {
    createTaskMutation.mutate({ data, sprintId });
  };

  if (isLoadingUsers) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            Carregando usuários. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (createTaskMutation.isSuccess) {
    return (
      <Card className="max-w-md mx-auto mt-8 text-center">
        <CardHeader>
          <CardTitle>Tarefa criada com sucesso</CardTitle>
          <CardDescription>A tarefa foi criada com sucesso.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (createTaskMutation.isError) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Erro ao criar tarefa</CardTitle>
          <CardDescription>
            A tarefa não foi criada. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (createTaskMutation.isPending) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            A tarefa está sendo criada. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-prose mx-auto mt-8">
      <CardHeader>
        <CardTitle>Criar tarefa</CardTitle>
        <CardDescription>
          Crie uma nova tarefa para este sprint.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    <Input {...field} />
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
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TASK_PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
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
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                    <Input
                      placeholder="Digite as tags separadas por vírgula"
                      value={field.value?.join(", ") || ""}
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter((tag) => tag.length > 0);
                        field.onChange(tags);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Separe as tags com vírgulas (ex: bug, frontend, urgente)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Criar tarefa</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
