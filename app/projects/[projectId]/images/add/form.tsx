"use client";

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
  getFileSignedUrl,
  updateImageUrlOnDatabase,
  uploadFileToS3,
  validateImage,
} from "./server-actions";
import {
  compressAndConvertToWebP,
  getImageDimensions,
} from "@/lib/image-utils";
import { useRouter } from "next/navigation";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Upload,
  FileImage,
  Database,
  Cloud,
  Link,
} from "lucide-react";

const URL_EXPIRES_IN = 60 * 60 * 24; // 24 hours

const formSchema = z.object({
  image: z.instanceof(File, { message: "Por favor, selecione uma imagem" }),
});

type formSchemaType = z.infer<typeof formSchema>;

type UploadStep =
  | "idle"
  | "validating"
  | "converting"
  | "getting-metadata"
  | "uploading-to-s3"
  | "creating-database-record"
  | "getting-signed-url"
  | "updating-database-url"
  | "completed"
  | "error";

export default function AddImageToProjectForm({
  projectId,
}: {
  projectId: string;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<UploadStep>("idle");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
    },
  });

  // Step 1: Validate Image
  const validateImageMutation = useMutation({
    mutationFn: async (image: File) => {
      setCurrentStep("validating");
      setProgress(10);
      return await validateImage(image);
    },
    onSuccess: (validatedImage) => {
      setProgress(20);
      convertToWebPMutation.mutate(validatedImage);
    },
    onError: (error) => {
      setCurrentStep("error");
      toast.error(`Erro na validação: ${error.message}`);
    },
  });

  // Step 2: Convert to WebP
  const convertToWebPMutation = useMutation({
    mutationFn: async (validatedImage: File) => {
      setCurrentStep("converting");
      setProgress(30);
      return await compressAndConvertToWebP({ file: validatedImage });
    },
    onSuccess: (compressedImage) => {
      setProgress(40);
      getFileMetadataMutation.mutate(compressedImage);
    },
    onError: (error) => {
      setCurrentStep("error");
      toast.error(`Erro na conversão: ${error.message}`);
    },
  });

  // Step 3: Get File Metadata and Dimensions
  const getFileMetadataMutation = useMutation({
    mutationFn: async (image: File) => {
      setCurrentStep("getting-metadata");
      setProgress(50);

      // Get image dimensions on client side
      const dimensions = await getImageDimensions(image);

      // Get file metadata from server
      const metadata = await getFileMetadata({ file: image });

      return {
        ...metadata,
        width: dimensions.width,
        height: dimensions.height,
      };
    },
    onSuccess: (metadata) => {
      setProgress(60);
      uploadFileToS3Mutation.mutate({
        buffer: metadata.buffer,
        path: metadata.path,
        type: metadata.type,
        size: metadata.size,
      });
    },
    onError: (error) => {
      setCurrentStep("error");
      toast.error(`Erro ao obter metadados: ${error.message}`);
    },
  });

  // Step 4: Upload to S3
  const uploadFileToS3Mutation = useMutation({
    mutationFn: async ({
      buffer,
      path,
      type,
      size,
    }: {
      buffer: string; // Now expecting base64 string
      path: string;
      type: string;
      size: number;
    }) => {
      setCurrentStep("uploading-to-s3");
      setProgress(70);
      return await uploadFileToS3({
        buffer,
        path,
        type,
        size,
      });
    },
    onSuccess: () => {
      setProgress(80);
      // Get the metadata from the previous step
      const metadata = getFileMetadataMutation.data;
      if (metadata) {
        createImageOnDatabaseMutation.mutate({
          uniqueFilename: metadata.name,
          path: metadata.path,
          originalName: selectedFile?.name || "unknown",
          size: metadata.size,
          type: metadata.type,
          width: metadata.width,
          height: metadata.height,
          projectId,
        });
      }
    },
    onError: (error) => {
      setCurrentStep("error");
      toast.error(`Erro no upload: ${error.message}`);
    },
  });

  // Step 5: Create Database Record
  const createImageOnDatabaseMutation = useMutation({
    mutationFn: async ({
      uniqueFilename,
      path,
      originalName,
      size,
      type,
      width,
      height,
      projectId,
    }: {
      uniqueFilename: string;
      path: string;
      originalName: string;
      size: number;
      type: string;
      width: number;
      height: number;
      projectId: string;
    }) => {
      setCurrentStep("creating-database-record");
      setProgress(85);

      console.log("creating-database-record", {
        uniqueFilename,
        path,
        originalName,
        size,
        type,
        width,
        height,
        projectId,
      });

      return await createImageOnDatabase({
        uniqueFilename,
        path,
        originalName,
        size,
        type,
        width,
        height,
        projectId,
      });
    },
    onSuccess: (data) => {
      setProgress(90);
      getFileSignedUrlMutation.mutate({
        path: data.path,
        expiresIn: URL_EXPIRES_IN,
      });
    },
    onError: (error) => {
      setCurrentStep("error");
      toast.error(`Erro ao criar registro: ${error.message}`);
    },
  });

  // Step 6: Get Signed URL
  const getFileSignedUrlMutation = useMutation({
    mutationFn: async ({
      path,
      expiresIn,
    }: {
      path: string;
      expiresIn: number;
    }) => {
      setCurrentStep("getting-signed-url");
      setProgress(95);
      return await getFileSignedUrl({
        path,
        expiresIn,
      });
    },
    onSuccess: (url) => {
      const imageId = createImageOnDatabaseMutation.data.id;
      if (imageId) {
        updateImageUrlOnDatabaseMutation.mutate({
          imageId,
          url,
          urlExpiresAt: new Date(Date.now() + URL_EXPIRES_IN * 1000),
        });
      }
    },
    onError: (error) => {
      setCurrentStep("error");
      toast.error(`Erro ao obter URL: ${error.message}`);
    },
  });

  // Step 7: Update Database with URL
  const updateImageUrlOnDatabaseMutation = useMutation({
    mutationFn: async ({
      imageId,
      url,
      urlExpiresAt,
    }: {
      imageId: string;
      url: string;
      urlExpiresAt: Date;
    }) => {
      setCurrentStep("updating-database-url");
      setProgress(100);
      return await updateImageUrlOnDatabase({
        imageId,
        url,
        urlExpiresAt,
      });
    },
    onSuccess: () => {
      setCurrentStep("completed");
      toast.success("Imagem enviada com sucesso!");
      setTimeout(() => {
        router.push(`/projects/${projectId}`);
      }, 1500);
    },
    onError: (error) => {
      setCurrentStep("error");
      toast.error(`Erro ao atualizar URL: ${error.message}`);
    },
  });

  const onSubmit = (data: formSchemaType) => {
    const image = data.image;
    setSelectedFile(image);
    setCurrentStep("validating");
    setProgress(0);
    validateImageMutation.mutate(image);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      setSelectedFile(file);
    }
  };

  const getStepInfo = (step: UploadStep) => {
    switch (step) {
      case "validating":
        return {
          title: "Validando imagem...",
          description: "Verificando formato e tamanho do arquivo",
          icon: <FileImage className="h-6 w-6" />,
        };
      case "converting":
        return {
          title: "Convertendo para WebP...",
          description: "Otimizando imagem para melhor performance",
          icon: <Upload className="h-6 w-6" />,
        };
      case "getting-metadata":
        return {
          title: "Obtendo metadados...",
          description: "Extraindo dimensões e informações da imagem",
          icon: <FileImage className="h-6 w-6" />,
        };
      case "uploading-to-s3":
        return {
          title: "Enviando para o servidor...",
          description: "Fazendo upload da imagem para o armazenamento",
          icon: <Cloud className="h-6 w-6" />,
        };
      case "creating-database-record":
        return {
          title: "Criando registro...",
          description: "Salvando informações no banco de dados",
          icon: <Database className="h-6 w-6" />,
        };
      case "getting-signed-url":
        return {
          title: "Gerando URL...",
          description: "Criando link seguro para a imagem",
          icon: <Link className="h-6 w-6" />,
        };
      case "updating-database-url":
        return {
          title: "Finalizando...",
          description: "Atualizando informações finais",
          icon: <Database className="h-6 w-6" />,
        };
      case "completed":
        return {
          title: "Sucesso!",
          description: "Imagem enviada com sucesso",
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        };
      case "error":
        return {
          title: "Erro",
          description: "Ocorreu um erro durante o upload",
          icon: <FileImage className="h-6 w-6 text-red-500" />,
        };
      default:
        return {
          title: "Adicionar imagem",
          description: "Selecione uma imagem para enviar",
          icon: <FileImage className="h-6 w-6" />,
        };
    }
  };

  const stepInfo = getStepInfo(currentStep);
  const isUploading =
    currentStep !== "idle" &&
    currentStep !== "completed" &&
    currentStep !== "error";

  return (
    <>
      <CardHeader>
        <div className="flex items-center space-x-3">
          {stepInfo.icon}
          <div>
            <CardTitle>{stepInfo.title}</CardTitle>
            <CardDescription>{stepInfo.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isUploading && (
          <div className="space-y-4 mb-6">
            <Progress value={progress} className="w-full" />
            <div className="text-center text-sm text-muted-foreground">
              {progress}% concluído
            </div>
          </div>
        )}

        {currentStep === "completed" && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <p className="text-lg font-medium text-green-700 dark:text-green-300">
              Imagem enviada com sucesso!
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecionando para o projeto...
            </p>
          </div>
        )}

        {currentStep === "error" && (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
              <FileImage className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-lg font-medium text-red-700 dark:text-red-300">
              Erro no upload
            </p>
            <p className="text-sm text-muted-foreground">
              Tente novamente ou selecione outra imagem
            </p>
            <Button
              onClick={() => {
                setCurrentStep("idle");
                setProgress(0);
                setSelectedFile(null);
                form.reset();
              }}
              variant="outline"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {(currentStep === "idle" || currentStep === "error") && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Imagem</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedFile && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileImage className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Enviando..." : "Adicionar imagem"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </>
  );
}
