"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  updateFutureProject,
  getAllDevTeams,
} from "./server-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COLOR_VALUES, getColorClassName } from "@/enums/colors";
import { COMPLEXITY_LEVELS } from "@/enums/complexity-levels";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import type { getFutureProjectForEdit } from "./server-actions";

const editFutureProjectFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  color: z.string().min(1),
  responsibleTeamId: z.string().optional(),
  complexity: z.string().optional(),
  socialImpact: z.number().min(1).max(10).optional(),
  semarhImpact: z.number().min(1).max(10).optional(),
  estimatedWeeks: z.number().min(1).optional(),
});

export type EditFutureProjectFormSchema = z.infer<
  typeof editFutureProjectFormSchema
>;

type Project = NonNullable<Awaited<ReturnType<typeof getFutureProjectForEdit>>>;

export default function EditFutureProject({ project }: { project: Project }) {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const form = useForm<EditFutureProjectFormSchema>({
    resolver: zodResolver(editFutureProjectFormSchema),
    defaultValues: {
      name: project.name ?? "",
      description: project.description ?? "",
      color: project.color ?? "",
      responsibleTeamId: project.responsibleTeam?.id ?? undefined,
      complexity: project.complexity ?? undefined,
      socialImpact: project.socialImpact ?? undefined,
      semarhImpact: project.semarhImpact ?? undefined,
      estimatedWeeks: project.estimatedWeeks ?? undefined,
    },
  });

  const { data: devTeams } = useQuery({
    queryKey: ["devTeams"],
    queryFn: getAllDevTeams,
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: EditFutureProjectFormSchema) =>
      updateFutureProject(projectId, data),
    onSuccess() {
      toast.success("Projeto atualizado com sucesso");
      router.replace("/future-projects");
    },
    onError() {
      toast.error("Erro ao atualizar projeto. Por favor, tente novamente.");
    },
  });

  useEffect(() => {
    if (updateProjectMutation.isSuccess) {
      updateProjectMutation.reset();
    }
  }, []);

  const onSubmit = (data: EditFutureProjectFormSchema) => {
    updateProjectMutation.mutate({
      ...data,
      responsibleTeamId:
        data.responsibleTeamId === "" ? undefined : data.responsibleTeamId,
    });
  };

  if (updateProjectMutation.isSuccess) {
    return (
      <>
        <CardHeader>
          <CardTitle>Sucesso!</CardTitle>
          <CardDescription>O projeto foi atualizado!</CardDescription>
        </CardHeader>
      </>
    );
  }

  if (updateProjectMutation.isError) {
    return (
      <>
        <CardHeader>
          <CardTitle>Erro!</CardTitle>
          <CardDescription>
            O projeto não foi atualizado. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  if (updateProjectMutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            O projeto está sendo atualizado. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Editar Projeto Futuro</CardTitle>
        <CardDescription>
          Edite as informações do projeto futuro.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma cor" />
                        </SelectTrigger>
                        <SelectContent>
                          {COLOR_VALUES.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div
                                className={cn(
                                  getColorClassName(color),
                                  "px-2 py-1 rounded"
                                )}
                              >
                                {color}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complexidade</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a complexidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPLEXITY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedWeeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Estimado (semanas)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="socialImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impacto para Sociedade (1-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semarhImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impacto para SEMARH (1-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="responsibleTeamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipe Responsável (opcional)</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value || undefined)
                      }
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Nenhuma equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {devTeams?.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Atualizar projeto
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
