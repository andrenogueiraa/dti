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
import { CheckIcon, XIcon } from "lucide-react";

export default function FormUploadImage({
  projectId,
  docId,
}: {
  projectId?: string;
  docId?: string;
}) {
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
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
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload image");
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
      </CardHeader>
      <CardContent>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          lang="pt-BR"
          name="image"
          required
          autoFocus
        />
      </CardContent>
    </>
  );
}
