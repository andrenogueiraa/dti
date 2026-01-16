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
import {
  deleteImage,
  finishProjectOpening,
  ProjectOpeningType,
  updateProjectOpening,
} from "./server-actions";
import FormUploadImage from "@/app/projects/[projectId]/images/add/form";
import Image from "next/image";
import { ButtonClose } from "@/components/custom/button-close";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2Icon } from "lucide-react";

const editProjectOpeningFormSchema = z.object({
  date: z.date(),
  content: z.string().min(1),
});

export type EditProjectOpeningFormSchema = z.infer<
  typeof editProjectOpeningFormSchema
>;

export default function EditProjectOpeningForm({
  docOpening,
  projectId,
}: {
  docOpening: NonNullable<ProjectOpeningType>;
  projectId: string;
}) {
  const router = useRouter();

  const form = useForm<EditProjectOpeningFormSchema>({
    resolver: zodResolver(editProjectOpeningFormSchema),
    defaultValues: {
      content: docOpening.content,
      date: docOpening.date,
    },
  });

  const updateProjectOpeningMutation = useMutation({
    mutationFn: updateProjectOpening,
    onSuccess() {
      toast.success("Documento de Abertura atualizado com sucesso");
    },
    onError(error) {
      toast.error(error.message || "Erro ao atualizar Documento de Abertura");
    },
  });

  const finishProjectOpeningMutation = useMutation({
    mutationFn: (docId: string) => finishProjectOpening(docId, projectId),
    onSuccess() {
      toast.success("Documento de Abertura finalizado com sucesso");
      router.push(`/projects/${projectId}/opening`);
    },
    onError(error) {
      toast.error(error.message || "Erro ao finalizar Documento de Abertura");
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess() {
      router.refresh();
      toast.success("Imagem excluída com sucesso");
    },
    onError(error) {
      toast.error(error.message || "Erro ao excluir imagem");
    },
  });

  const onSubmit = (data: EditProjectOpeningFormSchema) => {
    updateProjectOpeningMutation.mutate({ docId: docOpening.id, data });
  };

  return (
    <div className="grid grid-cols-2 gap-4 mx-auto">
      <div className="max-w-prose w-full mx-auto space-y-8 pt-8">
        <Card className="relative">
          <ButtonClose href={`/projects/${projectId}`} />
          <CardHeader>
            <CardTitle>Editar Documento de Abertura de Projeto</CardTitle>
            <CardDescription>
              Edite o Documento de Abertura. Se precisar, adicione imagens.
              Atenção, após clicar em &quot;Finalizar Documento&quot;, você não
              poderá editá-lo novamente.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          required
                          className="min-h-[480px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={updateProjectOpeningMutation.isPending}
                >
                  {updateProjectOpeningMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Salvar alterações"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-0 space-y-4">
            <FormUploadImage docId={docOpening.id} />
          </CardContent>
        </Card>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" type="button">
              Finalizar Documento
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Finalizar Documento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja finalizar o documento?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  finishProjectOpeningMutation.mutate(docOpening.id);
                }}
                disabled={finishProjectOpeningMutation.isPending}
              >
                {finishProjectOpeningMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Finalizar Documento"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="w-full max-w-prose mx-auto mt-8 relative">
        <ButtonClose href={`/projects/${projectId}`} />
        <CardHeader hidden>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Visualize o documento criado.</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleMarkdownPreview
            content={form.watch("content")}
            typeLabel={"Documento deAbertura de Projeto"}
            date={form.watch("date").toLocaleDateString("pt-BR")}
          />

          {docOpening.images.length > 0 && (
            <section className="prose mt-6">
              <h2>Anexos</h2>
              <div className="grid gap-6 mt-4">
                {docOpening.images.map((image) => (
                  <div key={image.id} className="relative">
                    <Image
                      src={image.url || ""}
                      alt={image.originalName}
                      width={image.width || 800}
                      height={image.height || 600}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir imagem</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a imagem?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              deleteImageMutation.mutate(image.id);
                            }}
                          >
                            Excluir imagem
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
