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
import { tailwindColors } from "@/shared-data/colors";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

const createProjectFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  color: z.string().min(1),
  responsibleTeamId: z.string(),
});

export type CreateProjectFormSchema = z.infer<typeof createProjectFormSchema>;

export default function CreateProject({ devTeamId }: { devTeamId: string }) {
  const form = useForm<CreateProjectFormSchema>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "",
      responsibleTeamId: devTeamId,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
  });

  const onSubmit = (data: CreateProjectFormSchema) => {
    createProjectMutation.mutate(data);
  };

  if (createProjectMutation.isSuccess) {
    const options = [
      {
        label: "Voltar para a lista de projetos",
        href: `/dev-teams/${devTeamId}`,
      },
      {
        label: "Ir para o perfil do projeto criado",
        href: `/projects/${createProjectMutation.data.id}`,
      },
      {
        label: "Criar outro projeto",
        href: `/dev-teams/${devTeamId}/projects/add`,
        command: () => {
          form.reset();
          createProjectMutation.reset();
        },
      },
    ];

    return (
      <>
        <CardHeader>
          <CardTitle>Projeto criado com sucesso</CardTitle>
          <CardDescription>O projeto foi criado com sucesso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {options.map((option) => (
            <Link
              href={option.href}
              className="block"
              key={option.label}
              onClick={option.command}
            >
              <Button className="w-full">{option.label}</Button>
            </Link>
          ))}
        </CardContent>
      </>
    );
  }

  if (createProjectMutation.isError) {
    return (
      <>
        <CardHeader>
          <CardTitle>Erro ao criar projeto</CardTitle>
          <CardDescription>
            O projeto não foi criado. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
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
        <CardTitle>Criar projeto</CardTitle>
        <CardDescription>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, aperiam.
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
                  <FormLabel>Name</FormLabel>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {tailwindColors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div
                              className={cn(color.value, "px-2 py-1 rounded")}
                            >
                              {color.label}
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

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
