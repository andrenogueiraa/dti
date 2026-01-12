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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { createSprint } from "./server-actions";
import { useParams, useRouter } from "next/navigation";
import { ButtonClose } from "@/components/custom/button-close";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const createSprintFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  startDate: z.date(),
  finishDate: z.date(),
  progress: z.number().min(0).max(100),
});

export type CreateSprintFormSchema = z.infer<typeof createSprintFormSchema>;

export default function CreateSprintForm() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const form = useForm<CreateSprintFormSchema>({
    resolver: zodResolver(createSprintFormSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date(),
      finishDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      progress: 0,
    },
  });

  const createSprintMutation = useMutation({
    mutationFn: createSprint,
    onSuccess() {
      toast.success("Sprint criada com sucesso");
      router.push(`/projects/${projectId}`);
    },
    onError(error: Error) {
      toast.error(error.message || "Erro ao criar sprint");
    },
  });

  const onSubmit = (data: CreateSprintFormSchema) => {
    createSprintMutation.mutate({ data, projectId });
  };

  if (createSprintMutation.isSuccess) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle>Sprint criada com sucesso</CardTitle>
          <CardDescription>O sprint foi criada com sucesso.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (createSprintMutation.isError) {
    return (
      <Card className="max-w-md mx-auto relative">
        <ButtonClose href={`/projects/${projectId}`} />
        <CardHeader>
          <CardTitle>Erro ao criar sprint</CardTitle>
          <CardDescription>
            A sprint não foi criada. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Button onClick={() => createSprintMutation.reset()}>
            Tentar novamente
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (createSprintMutation.isPending) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            O sprint está sendo criado. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto relative">
      <CardHeader>
        <ButtonClose />
        <CardTitle className="text-2xl">Criar sprint</CardTitle>
        <CardDescription className="text-base">
          A data de início não poderá ser alterada posteriormente. A data de
          término e o progresso podem ser alterados até o final da sprint.
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
                    <Input {...field} autoFocus />
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
                    <Textarea {...field} rows={8} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value instanceof Date
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const dateValue = e.target.value
                          ? new Date(e.target.value)
                          : new Date();
                        field.onChange(dateValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="finishDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Finish Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value instanceof Date
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const dateValue = e.target.value
                          ? new Date(e.target.value)
                          : new Date();
                        field.onChange(dateValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Criar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
