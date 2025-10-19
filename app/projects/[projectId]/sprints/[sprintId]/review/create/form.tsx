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
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Textarea } from "@/components/ui/textarea";
import { SimpleMarkdownPreview } from "@/components/custom/simple-markdown-preview";
import FileUpload from "@/components/custom/file-upload";
import { createSprintReview } from "./server-actions";
import { useState } from "react";

const createSprintReviewFormSchema = z.object({
  date: z.date(),
  content: z.string().min(1),
});

export type CreateSprintReviewFormSchema = z.infer<
  typeof createSprintReviewFormSchema
>;

export default function CreateSprintReview({
  projectId,
  sprintId,
}: {
  projectId: string;
  sprintId: string;
}) {
  const router = useRouter();
  const [imageIds, setImageIds] = useState<string[]>([]);

  const form = useForm<CreateSprintReviewFormSchema>({
    resolver: zodResolver(createSprintReviewFormSchema),
    defaultValues: {
      content:
        "## Subtítulo 1\nAqui você deve escrever o conteúdo do documento. Você pode utilizar asteriscos para incluir **negritos** e *itálicos*.\n\n## Subtítulo 2\nMais conteúdo aqui.",
      date: new Date(),
    },
  });

  const createSprintReviewMutation = useMutation({
    mutationFn: createSprintReview,
    onSuccess() {
      router.push(`/projects/${projectId}/sprints/${sprintId}/review/`);
    },
  });

  const onSubmit = (data: CreateSprintReviewFormSchema) => {
    createSprintReviewMutation.mutate({ data, sprintId, imageIds });
  };

  if (createSprintReviewMutation.isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8 text-center">
        <CardHeader>
          <CardTitle>Sprint Review criado com sucesso</CardTitle>
          <CardDescription>O documento foi criado com sucesso.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (createSprintReviewMutation.isError) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Erro ao criar Sprint Review</CardTitle>
          <CardDescription>
            {createSprintReviewMutation.error?.message ??
              "Erro ao criar Sprint Review"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (createSprintReviewMutation.isPending) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
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
    <div className="grid grid-cols-2 gap-4 mx-auto">
      <Card className="w-full max-w-prose min-w-prose mx-auto mt-8">
        <CardHeader>
          <CardTitle>Criar Sprint Review</CardTitle>
          <CardDescription>
            Crie um Sprint Review com formatação simples.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Imagens</h3>
                <FileUpload
                  config={{
                    maxFiles: 5,
                    maxFileSize: 5 * 1024 * 1024, // 5MB
                    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
                  }}
                  onFilesChange={setImageIds}
                  language="pt-br"
                />
              </div>

              <Button type="submit" className="w-full">
                Salvar Sprint Review
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-prose min-w-prose mx-auto mt-8">
        <CardHeader hidden>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Visualize o documento criado.</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleMarkdownPreview
            content={form.watch("content")}
            typeLabel={"Sprint Review"}
            date={form.watch("date").toLocaleDateString("pt-BR")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
