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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDoc, getDocTypes } from "./server-actions";
import { Textarea } from "@/components/ui/textarea";
import { SimpleMarkdownPreview } from "@/components/custom/simple-markdown-preview";

const createDocFormSchema = z.object({
  typeId: z.string().min(1),
  date: z.date(),
  content: z.string().min(1),
});

export type CreateDocFormSchema = z.infer<typeof createDocFormSchema>;

export default function CreateProject() {
  const router = useRouter();

  const form = useForm<CreateDocFormSchema>({
    resolver: zodResolver(createDocFormSchema),
    defaultValues: {
      content:
        "## Subtítulo 1\nAqui você deve escrever o conteúdo do documento. Você pode utilizar asteriscos para incluir **negritos** e *itálicos*.\n\n## Subtítulo 2\nMais conteúdo aqui.",
      date: new Date(),
      typeId: "",
    },
  });

  const docTypesQuery = useQuery({
    queryKey: ["doc-types"],
    queryFn: async () => await getDocTypes(),
    retry: false,
  });

  const createDocMutation = useMutation({
    mutationFn: createDoc,
    onSuccess(data) {
      router.push(`/docs/${data.id}`);
    },
  });

  const onSubmit = (data: CreateDocFormSchema) => {
    createDocMutation.mutate(data);
  };

  if (createDocMutation.isSuccess) {
    return (
      <Card className="max-w-md mx-auto mt-8 text-center">
        <CardHeader>
          <CardTitle>Documento criado com sucesso</CardTitle>
          <CardDescription>O documento foi criado com sucesso.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (createDocMutation.isError) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Erro ao criar documento</CardTitle>
          <CardDescription>
            O documento não foi criado. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (createDocMutation.isPending) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            O documento está sendo criado. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="max-w-prose w-full mx-auto mt-8">
        <CardHeader>
          <CardTitle>Criar documento</CardTitle>
          <CardDescription>
            Crie um documento com formatação simples. Clique em qualquer linha
            para editá-la.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="typeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        {docTypesQuery.isLoading ? (
                          <SelectTrigger>
                            <SelectValue placeholder="Carregando..." />
                          </SelectTrigger>
                        ) : docTypesQuery.isError ? (
                          <SelectTrigger>
                            <SelectValue placeholder="Erro ao carregar tipos de documento" />
                          </SelectTrigger>
                        ) : docTypesQuery.isSuccess &&
                          docTypesQuery.data.length === 0 ? (
                          <SelectTrigger>
                            <SelectValue placeholder="Nenhum tipo de documento encontrado" />
                          </SelectTrigger>
                        ) : docTypesQuery.isSuccess &&
                          docTypesQuery.data.length > 0 ? (
                          <>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {docTypesQuery.data.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </>
                        ) : (
                          <SelectTrigger>
                            <SelectValue placeholder="Erro desconhecido" />
                          </SelectTrigger>
                        )}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input
                        required
                        type="date"
                        value={
                          field.value instanceof Date &&
                          !isNaN(field.value.getTime())
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? new Date(e.target.value)
                              : new Date()
                          )
                        }
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea {...field} required className="min-h-[480px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Confirmar</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-prose mx-auto mt-8">
        <CardHeader hidden>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Visualize o documento criado.</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleMarkdownPreview
            content={form.watch("content")}
            typeLabel={
              docTypesQuery.data?.find(
                (type) => type.id === form.watch("typeId")
              )?.name || undefined
            }
            date={form.watch("date").toLocaleDateString("pt-BR")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
