"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PROJECT_STATUS_VALUES,
  PROJECT_STATUSES,
  ProjectStatus,
} from "@/enums/project-statuses";
import { toast } from "sonner";
import { changeProjectStatus } from "./server-actions";
import { useMutation } from "@tanstack/react-query";

import LoadingPage from "@/components/custom/loading-page";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const ChangeStatusFormSchema = z.object({
  status: z.enum(PROJECT_STATUS_VALUES),
});

export type ChangeStatusFormSchema = z.infer<typeof ChangeStatusFormSchema>;

export function ChangeStatusForm({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const form = useForm<ChangeStatusFormSchema>({
    resolver: zodResolver(ChangeStatusFormSchema),
    defaultValues: {
      status: currentStatus as ProjectStatus,
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: changeProjectStatus,
    onSuccess: () => {
      toast.success("Status do projeto alterado com sucesso");
    },
  });

  const onSubmit = (data: ChangeStatusFormSchema) => {
    changeStatusMutation.mutate({ data, projectId });
  };

  if (changeStatusMutation.isPending) {
    return <LoadingPage />;
  }

  if (changeStatusMutation.isSuccess) {
    return (
      <>
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <CheckIcon className="text-green-500 size-16" />
          </CardTitle>
          <CardDescription className="text-center">
            O status do projeto foi alterado com sucesso.
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <Button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="w-full"
          >
            Voltar para o projeto
          </Button>
        </CardFooter>
      </>
    );
  }

  if (changeStatusMutation.isError) {
    return (
      <>
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <XIcon className="text-red-500 size-16" />
          </CardTitle>
          <CardDescription className="text-center">
            O status do projeto não foi alterado. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => changeStatusMutation.reset()}
            className="w-full"
          >
            Tentar novamente
          </Button>
        </CardFooter>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Alterar status do projeto</CardTitle>
        <CardDescription>Selecione o status do projeto.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor="change-status" hidden>
                      Status do projeto
                    </FieldLabel>
                    <FieldDescription hidden>
                      Selecione o status do projeto.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="change-status"
                      aria-invalid={fieldState.invalid}
                      className="min-w-[120px]"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {PROJECT_STATUS_VALUES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {
                            PROJECT_STATUSES.find((s) => s.value === status)
                              ?.label
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            type="submit"
            className="w-full"
            disabled={changeStatusMutation.isPending}
          >
            {changeStatusMutation.isPending
              ? "Alterando status..."
              : "Alterar status"}
          </Button>
        </form>
      </CardContent>
    </>
  );
}
