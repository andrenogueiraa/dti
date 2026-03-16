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
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import createDevTeam, { getRoles, getUsers } from "./server-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createDevTeamFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  imageUrl: z
    .string()
    .url("Informe uma URL válida")
    .optional()
    .or(z.literal("")),
  userId: z.string().optional(),
  roleId: z.string().optional(),
});

export type CreateDevTeamFormSchema = z.infer<typeof createDevTeamFormSchema>;

export default function CreateDevTeam() {
  const router = useRouter();

  const form = useForm<CreateDevTeamFormSchema>({
    resolver: zodResolver(createDevTeamFormSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      userId: undefined,
      roleId: undefined,
    },
  });

  const usersQuery = useQuery({
    queryKey: ["users-for-dev-team-create"],
    queryFn: async () => await getUsers(),
  });

  const rolesQuery = useQuery({
    queryKey: ["roles-for-dev-team-create"],
    queryFn: async () => await getRoles(),
  });

  const createDevTeamMutation = useMutation({
    mutationFn: async (data: CreateDevTeamFormSchema) => {
      await createDevTeam({
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl || undefined,
        userId: data.userId || undefined,
        roleId: data.roleId || undefined,
      });
    },
    onSuccess() {
      toast.success("Time de desenvolvimento criado com sucesso");
      router.push("/");
    },
  });

  const onSubmit = (data: CreateDevTeamFormSchema) => {
    createDevTeamMutation.mutate(data);
  };

  if (createDevTeamMutation.isSuccess) {
    return (
      <>
        <CardHeader>
          <CardTitle>Sucesso!</CardTitle>
          <CardDescription>O time de desenvolvimento foi criado!</CardDescription>
        </CardHeader>
      </>
    );
  }

  if (createDevTeamMutation.isError) {
    return (
      <>
        <CardHeader>
          <CardTitle>Erro!</CardTitle>
          <CardDescription>
            O time de desenvolvimento não foi criado. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  if (createDevTeamMutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            O time de desenvolvimento está sendo criado. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Criar time de desenvolvimento</CardTitle>
        <CardDescription>
          Crie um novo time de desenvolvimento para organizar seus projetos.
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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da imagem (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário inicial (opcional)</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-full">
                        {usersQuery.isLoading ? (
                          <SelectValue placeholder="Carregando usuários..." />
                        ) : usersQuery.isError ? (
                          <SelectValue placeholder="Erro ao carregar usuários" />
                        ) : usersQuery.isSuccess &&
                          usersQuery.data.length > 0 ? (
                          <SelectValue placeholder="Selecione um usuário (opcional)" />
                        ) : (
                          <SelectValue placeholder="Nenhum usuário encontrado" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {usersQuery.isSuccess &&
                          usersQuery.data.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
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
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função do usuário (opcional)</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-full">
                        {rolesQuery.isLoading ? (
                          <SelectValue placeholder="Carregando funções..." />
                        ) : rolesQuery.isError ? (
                          <SelectValue placeholder="Erro ao carregar funções" />
                        ) : rolesQuery.isSuccess &&
                          rolesQuery.data.length > 0 ? (
                          <SelectValue placeholder="Selecione uma função (opcional)" />
                        ) : (
                          <SelectValue placeholder="Nenhuma função encontrada" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {rolesQuery.isSuccess &&
                          rolesQuery.data.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
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
              Criar time
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}

