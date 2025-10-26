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
import { SprintReviewType, updateSprintReview } from "./server-actions";
import FormUploadImage from "@/app/projects/[projectId]/images/add/form";
import Image from "next/image";
import { ButtonClose } from "@/components/custom/button-close";

const editSprintReviewFormSchema = z.object({
  date: z.date(),
  content: z.string().min(1),
});

export type EditSprintReviewFormSchema = z.infer<
  typeof editSprintReviewFormSchema
>;

export default function EditSprintReviewForm({
  docReview,
  projectId,
  sprintId,
}: {
  docReview: NonNullable<SprintReviewType>;
  projectId: string;
  sprintId: string;
}) {
  const router = useRouter();

  const form = useForm<EditSprintReviewFormSchema>({
    resolver: zodResolver(editSprintReviewFormSchema),
    defaultValues: {
      content: docReview.content,
      date: docReview.date,
    },
  });

  const updateSprintReviewMutation = useMutation({
    mutationFn: updateSprintReview,
    onSuccess() {
      updateSprintReviewMutation.reset();
      router.push(`/projects/${projectId}/sprints/${sprintId}/review/`);
    },
  });

  const onSubmit = (data: EditSprintReviewFormSchema) => {
    updateSprintReviewMutation.mutate({ docId: docReview.id, data });
  };

  if (updateSprintReviewMutation.isSuccess) {
    return (
      <Card className="max-w-md mx-auto mt-8 text-center">
        <CardHeader>
          <CardTitle>Sprint Review atualizado com sucesso</CardTitle>
          <CardDescription>O documento foi criado com sucesso.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (updateSprintReviewMutation.isError) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Erro ao atualizar Sprint Review</CardTitle>
          <CardDescription>
            O documento não foi atualizado. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (updateSprintReviewMutation.isPending) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            O documento está sendo atualizado. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 mx-auto">
      <Card className="max-w-prose w-full mx-auto mt-8 relative">
        <ButtonClose href={`/projects/${projectId}`} />
        <CardHeader>
          <CardTitle>Atualizar Sprint Review</CardTitle>
          <CardDescription>
            Atualize o Sprint Review com formatação simples.
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

              <Button type="submit">Salvar alterações</Button>
            </form>
          </Form>
        </CardContent>

        <FormUploadImage docId={docReview.id} />
      </Card>

      <Card className="w-full max-w-prose mx-auto mt-8 relative">
        <ButtonClose href={`/projects/${projectId}`} />
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

          {docReview.images.length > 0 && (
            <section className="prose mt-6">
              <h2>Anexos</h2>
              <div className="grid gap-6 mt-4">
                {docReview.images.map((image) => (
                  <div key={image.id}>
                    <Image
                      src={image.url || ""}
                      alt={image.originalName}
                      width={image.width || 800}
                      height={image.height || 600}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
