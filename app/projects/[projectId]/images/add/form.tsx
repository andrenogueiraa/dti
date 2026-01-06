"use client";

import { Input } from "@/components/ui/input";
import {
  getImageDimensions,
  compressAndConvertToWebP,
} from "@/lib/image-utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import { CheckIcon, XIcon, UploadIcon, ImageIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function FormUploadImage({
  projectId,
  docId,
}: {
  projectId?: string;
  docId?: string;
}) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const processFile = async (file: File) => {
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Convert image to WebP with 100% quality and max 1080px width
      const convertedFile = await compressAndConvertToWebP({ file });

      const formData = new FormData();
      formData.append("image", convertedFile);
      if (projectId) formData.append("projectId", projectId);
      if (docId) formData.append("docId", docId);
      const { width, height } = await getImageDimensions(convertedFile);
      formData.append("width", width.toString());
      formData.append("height", height.toString());

      uploadMutation.mutate(formData);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process image"
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await processFile(file);
    } else {
      toast.error("Por favor, solte apenas arquivos de imagem");
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      let data;

      try {
        data = await response.json();
      } catch (e) {
        console.error(
          "Failed to parse JSON response:",
          e,
          "Status:",
          response.status
        );
        throw new Error(
          `Server error (${response.status}): ${
            response.statusText || "Unknown error"
          }`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Image uploaded successfully");
      if (projectId) {
        router.push(`/projects/${projectId}`);
      }
      if (docId) {
        uploadMutation.reset();
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload image");
    },
    onSettled() {
      setPreview(null);
    },
  });

  if (uploadMutation.isPending) {
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (uploadMutation.isSuccess) {
    return (
      <CardHeader className="flex flex-col items-center justify-center">
        <CardTitle>
          <CheckIcon className="text-green-500 size-12" />
        </CardTitle>
        <CardDescription>Imagem enviada com sucesso</CardDescription>
      </CardHeader>
    );
  }

  if (uploadMutation.isError) {
    return (
      <>
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle>
            <XIcon className="text-red-500 size-12" />
          </CardTitle>
          <CardDescription>
            Failed to upload image: {uploadMutation.error?.message}
          </CardDescription>
        </CardHeader>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Adicionar imagem</CardTitle>
        <CardDescription>
          Clique para selecionar ou arraste e solte sua imagem aqui
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ease-in-out
            ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }
            cursor-pointer
          `}
        >
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            lang="pt-BR"
            name="image"
            required
            autoFocus
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            id="file-input"
          />

          <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
            {preview ? (
              <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <>
                <div className="relative">
                  <div
                    className={`
                      p-4 rounded-full bg-primary/10 transition-transform duration-200
                      ${isDragging ? "scale-110" : "scale-100"}
                    `}
                  >
                    {isDragging ? (
                      <ImageIcon className="w-8 h-8 text-primary" />
                    ) : (
                      <UploadIcon className="w-8 h-8 text-primary" />
                    )}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">
                    {isDragging
                      ? "Solte a imagem aqui"
                      : "Clique para selecionar ou arraste uma imagem"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP ou GIF (máx. 1080px de largura)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </>
  );
}
