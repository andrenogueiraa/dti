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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import createProject from "./server-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COLOR_VALUES, getColorClassName } from "@/enums/colors";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AREAS } from "@/enums/areas";

const createProjectFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  color: z.string().min(1),
  responsibleTeamId: z.string(),
  area: z.string().optional(),
});

export type CreateProjectFormSchema = z.infer<typeof createProjectFormSchema>;

export default function CreateProject({ devTeamId }: { devTeamId: string }) {
  const router = useRouter();
  const form = useForm<CreateProjectFormSchema>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "",
      responsibleTeamId: devTeamId,
      area: undefined,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess() {
      toast.success("Projeto criado com sucesso");
      router.push(`/dev-teams/${devTeamId}`);
    },
  });

  const onSubmit = (data: CreateProjectFormSchema) => {
    createProjectMutation.mutate(data);
  };

  if (createProjectMutation.isSuccess) {
    return (
      <>
        <CardHeader>
          <CardTitle>Sucesso!</CardTitle>
          <CardDescription>O projeto foi criado!</CardDescription>
        </CardHeader>
      </>
    );
  }

  if (createProjectMutation.isError) {
    return (
      <>
        <CardHeader>
          <CardTitle>Erro!</CardTitle>
          <CardDescription>
            O projeto não foi criado. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  if (createProjectMutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            O projeto está sendo criado. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Criar projeto</CardTitle>
        <CardDescription>
          Crie um novo projeto para esta equipe.
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
                    <Input {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma área de aplicação" />
                      </SelectTrigger>
                      <SelectContent>
                        {AREAS.map((area) => (
                          <SelectItem key={area.value} value={area.value}>
                            {area.label}
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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

            <Button type="submit" className="w-full">
              Criar projeto
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
