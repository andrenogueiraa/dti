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
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { updateDevTeam } from "./server-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const editDevTeamFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  imageUrl: z
    .string()
    .url("Informe uma URL válida")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

export type EditDevTeamFormSchema = z.infer<typeof editDevTeamFormSchema>;

type EditDevTeamProps = {
  devTeam: {
    id: string;
    name: string | null;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean | null;
  };
};

export default function EditDevTeam({ devTeam }: EditDevTeamProps) {
  const router = useRouter();

  const form = useForm<EditDevTeamFormSchema>({
    resolver: zodResolver(editDevTeamFormSchema),
    defaultValues: {
      name: devTeam.name ?? "",
      description: devTeam.description ?? "",
      imageUrl: devTeam.imageUrl ?? "",
      isActive: devTeam.isActive ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: EditDevTeamFormSchema) =>
      updateDevTeam(devTeam.id, {
        ...data,
        imageUrl: data.imageUrl || undefined,
      }),
    onSuccess() {
      toast.success("Time de desenvolvimento atualizado com sucesso");
      router.push(`/dev-teams/${devTeam.id}`);
    },
  });

  const onSubmit = (data: EditDevTeamFormSchema) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess) {
    return (
      <>
        <CardHeader>
          <CardTitle>Sucesso!</CardTitle>
          <CardDescription>
            O time de desenvolvimento foi atualizado!
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  if (mutation.isError) {
    return (
      <>
        <CardHeader>
          <CardTitle>Erro!</CardTitle>
          <CardDescription>
            O time de desenvolvimento não foi atualizado. Por favor, tente
            novamente.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  if (mutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            O time de desenvolvimento está sendo atualizado. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Editar time de desenvolvimento</CardTitle>
        <CardDescription>
          Atualize as informações deste time de desenvolvimento.
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
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="space-y-0.5">
                    <FormLabel>Time ativo</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Controle se este time aparece na listagem principal.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Salvar alterações
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}

