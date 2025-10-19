"use client";

import { getFileSignedUrl } from "@/app/uploads/server-actions";
import {
  FormField,
  FormLabel,
  FormItem,
  Form,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  createImageOnDatabase,
  getFileMetadata,
  updateImageUrlOnDatabase,
  uploadFileToS3,
  validateImage,
} from "./server-actions";
import { compressAndConvertToWebP } from "@/lib/image-utils";
import { useRouter } from "next/navigation";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  image: z.instanceof(File),
});

type formSchemaType = z.infer<typeof formSchema>;

export default function AddImageToProjectForm({
  projectId,
}: {
  projectId: string;
}) {
  const router = useRouter();
  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
    },
  });

  const updateImageUrlOnDatabaseMutation = useMutation({
    mutationFn: async (imageId: string, url: string, urlExpiresAt: Date) => {
      await updateImageUrlOnDatabase({
        imageId,
        url,
        urlExpiresAt,
      });
    },
    onSuccess: (data) => {
      toast.success("URL da imagem atualizada com sucesso");
      router.push(`/projects/${projectId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getFileSignedUrlMutation = useMutation({
    mutationFn: async (data: formSchemaType) => {
      return await getFileSignedUrl({
        path: data.image.path,
        expiresIn: 60 * 60 * 24,
      });
    },
  });

  const createImageOnDatabaseMutation = useMutation({
    mutationFn: async (data: formSchemaType) => {
      return await createImageOnDatabase({
        uniqueFilename: data.image.uniqueFilename,
        path: data.image.path,
        originalName: data.image.originalName,
        size: data.image.size,
        type: data.image.type,
        width: data.image.width,
        height: data.image.height,
        projectId,
      });
    },
    onSuccess: (data) => {
      toast.success("Imagem criada com sucesso");
      getFileSignedUrlMutation.mutate(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadFileToS3Mutation = useMutation({
    mutationFn: async ({
      buffer,
      path,
      type,
      size,
    }: {
      buffer: Buffer;
      path: string;
      type: string;
      size: number;
    }) => {
      return await uploadFileToS3({
        buffer,
        path,
        type,
        size,
      });
    },
    onSuccess: (data) => {
      toast.success("Arquivo enviado para o S3 com sucesso");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getFileMetadataMutation = useMutation({
    mutationFn: async (image: File) => {
      return await getFileMetadata({ file: image });
    },
    onSuccess: (path, buffer, type, size) => {
      toast.success("Metadados da imagem obtidos com sucesso");
      uploadFileToS3Mutation.mutate({
        buffer,
        path,
        type,
        size,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const convertToWebPMutation = useMutation({
    mutationFn: async (validatedImage: File) =>
      await compressAndConvertToWebP({ file: validatedImage }),
    onSuccess: (compressedImage) => {
      toast.success("Imagem convertida para WebP com sucesso");
      getFileMetadataMutation.mutate(compressedImage);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const validateImageMutation = useMutation({
    mutationFn: async (image: File) => await validateImage(image),
    onSuccess: (validatedImage) => {
      toast.success("Imagem validada com sucesso");
      convertToWebPMutation.mutate(validatedImage);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: formSchemaType) => {
    const image = data.image;

    validateImageMutation.mutate(image);
  };

  if (updateImageUrlOnDatabaseMutation.isSuccess) {
    return (
      <>
        <CardHeader>
          <CardTitle>Sucesso!</CardTitle>
        </CardHeader>
      </>
    );
  }

  if (updateImageUrlOnDatabaseMutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Atualizando URL da imagem no banco de dados...</CardTitle>
        </CardHeader>
      </>
    );
  }

  if (getFileSignedUrlMutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Obtendo URL de assinatura...</CardTitle>
        </CardHeader>
      </>
    );
  }

  if (createImageOnDatabaseMutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Criando imagem no banco de dados...</CardTitle>
        </CardHeader>
      </>
    );
  }

  if (uploadFileToS3Mutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Enviando imagem para o S3...</CardTitle>
        </CardHeader>
      </>
    );
  }

  if (getFileMetadataMutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Obtendo metadados da imagem...</CardTitle>
        </CardHeader>
      </>
    );
  }

  if (convertToWebPMutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Convertendo imagem para WebP...</CardTitle>
        </CardHeader>
      </>
    );
  }
  if (validateImageMutation.isPending) {
    return (
      <>
        <CardHeader>
          <CardTitle>Validando imagem...</CardTitle>
        </CardHeader>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Adicionar imagem</CardTitle>
        <CardDescription>
          Adicione uma imagem para este projeto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem</FormLabel>
                  <FormControl>
                    <Input type="file" {...field} value={field.value?.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Adicionar imagem
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
