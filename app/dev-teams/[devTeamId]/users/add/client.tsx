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
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import addUserToTeam, { getRoles, getUsers } from "./server-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@iconify/react";

const addUserToTeamFormSchema = z.object({
  userId: z.string().min(1),
  roleId: z.string().min(1),
  devTeamId: z.string().min(1),
});

export type AddUserToTeamFormSchema = z.infer<typeof addUserToTeamFormSchema>;

export default function CreateProject({ devTeamId }: { devTeamId: string }) {
  const router = useRouter();

  const form = useForm<AddUserToTeamFormSchema>({
    resolver: zodResolver(addUserToTeamFormSchema),
    defaultValues: {
      userId: "",
      roleId: "",
      devTeamId: devTeamId,
    },
  });

  const addUserToTeamMutation = useMutation({
    mutationFn: addUserToTeam,
    onSuccess() {
      toast.success("Usuário adicionado com sucesso");
      router.push(`/dev-teams/${devTeamId}`);
    },
  });

  const onSubmit = (data: AddUserToTeamFormSchema) => {
    addUserToTeamMutation.mutate(data);
  };

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => await getUsers(),
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => await getRoles(),
  });

  if (addUserToTeamMutation.isSuccess) {
    return (
      <>
        <CardHeader>
          <CardTitle>Usuário adicionado com sucesso</CardTitle>
          <CardDescription>
            O usuário foi adicionado com sucesso.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  if (addUserToTeamMutation.isError) {
    return (
      <>
        <CardHeader>
          <CardTitle>Erro ao adicionar usuário</CardTitle>
          <CardDescription>
            O usuário não foi adicionado. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              form.reset();
              addUserToTeamMutation.reset();
            }}
          >
            Resetar
          </Button>
        </CardContent>
      </>
    );
  }

  if (addUserToTeamMutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            O usuário está sendo adicionado. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <Icon
          icon="material-symbols:person-add-outline-rounded"
          className="size-12 text-primary/50 rounded-md p-1"
        />
        <CardTitle className="text-2xl">Adicionar usuário</CardTitle>
        <CardDescription>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, aperiam.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        {usersQuery.isLoading ? (
                          <SelectValue placeholder="Carregando..." />
                        ) : usersQuery.isError ? (
                          <SelectValue placeholder="Erro ao carregar usuários" />
                        ) : usersQuery.isSuccess &&
                          usersQuery.data.length > 0 ? (
                          <SelectValue placeholder="Selecione um usuário" />
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
                  <FormLabel>Função</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        {rolesQuery.isLoading ? (
                          <SelectValue placeholder="Carregando..." />
                        ) : rolesQuery.isError ? (
                          <SelectValue placeholder="Erro ao carregar funções" />
                        ) : rolesQuery.isSuccess &&
                          rolesQuery.data.length > 0 ? (
                          <SelectValue placeholder="Selecione uma função" />
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
              Adicionar
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
