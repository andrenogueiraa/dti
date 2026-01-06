"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
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
import { changeEndDate, getSprint } from "./server-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDateForInput, parseDateFromInput } from "@/lib/date-utils";

const changeEndDateFormSchema = z.object({
  finishDate: z.date(),
});

export type ChangeEndDateFormSchema = z.infer<typeof changeEndDateFormSchema>;

export default function ChangeEndDateForm({
  projectId,
  sprint,
}: {
  projectId: string;
  sprint: NonNullable<Awaited<ReturnType<typeof getSprint>>>;
}) {
  const router = useRouter();

  const form = useForm<ChangeEndDateFormSchema>({
    resolver: zodResolver(changeEndDateFormSchema),
    defaultValues: {
      finishDate: new Date(),
    },
  });

  // Update form when sprint data loads
  useEffect(() => {
    if (sprint.finishDate) {
      const date = new Date(sprint.finishDate);
      // Only update if the date is valid
      if (!isNaN(date.getTime())) {
        form.reset({
          finishDate: date,
        });
      }
    }
  }, [sprint.finishDate, form]);

  const changeEndDateMutation = useMutation({
    mutationFn: changeEndDate,
    onSuccess() {
      router.push(`/projects/${projectId}`);
      router.refresh();
      toast.success("Data de término alterada com sucesso");
      changeEndDateMutation.reset();
    },
  });

  const onSubmit = (data: ChangeEndDateFormSchema) => {
    changeEndDateMutation.mutate({
      data,
      sprintId: sprint.id,
      projectId,
      reviewId: sprint.docReviewId,
    });
  };

  if (changeEndDateMutation.isSuccess) {
    return (
      <>
        <CardHeader>
          <CardTitle>Data de término alterada com sucesso</CardTitle>
          <CardDescription>
            A data de término do sprint foi alterada com sucesso.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  if (changeEndDateMutation.isError) {
    return (
      <>
        <CardHeader>
          <CardTitle>Erro ao alterar data de término</CardTitle>
          <CardDescription>
            A data de término não foi alterada. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  if (changeEndDateMutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
          <CardDescription>
            A data de término está sendo alterada. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Alterar data de término</CardTitle>
        <CardDescription>
          Altere a data de término deste sprint.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="finishDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de término</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value && !isNaN(field.value.getTime())
                          ? formatDateForInput(field.value)
                          : ""
                      }
                      onChange={(e) => {
                        const dateString = e.target.value;
                        if (dateString) {
                          const date = parseDateFromInput(dateString);
                          if (!isNaN(date.getTime())) {
                            field.onChange(date);
                          }
                        }
                      }}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Alterar data de término
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
