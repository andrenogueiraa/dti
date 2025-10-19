"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadImage } from "@/app/uploads/server-actions";
import { useState, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  compressAndConvertToWebP,
  getImageDimensions,
} from "@/lib/image-utils";

interface FileUploadConfig {
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  allowedTypes?: string[];
  accept?: Record<string, string[]>;
  multiple?: boolean;
}

type Language = "pt-br" | "en";

const DEFAULT_CONFIG: Required<FileUploadConfig> = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 5,
  allowedTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ],
  accept: {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    "application/pdf": [".pdf"],
  },
  multiple: true,
};

const TRANSLATIONS = {
  "pt-br": {
    fileSelected: "Arquivo Selecionado",
    filesSelected: "Arquivos Selecionados",
    dropFilesHere: "Arraste seus arquivos aqui",
    dropFilesHereActive: "Solte os arquivos aqui",
    fileTypeNotSupported: "Tipo de arquivo não suportado",
    clickToBrowse: "clique para procurar",
    or: "ou",
    each: "cada",
    fileTypesDescription: "Imagens (JPEG, PNG, GIF, WebP) e arquivos PDF até",
    maximumFiles: "Máximo",
    files: "arquivos",
    selectedFiles: "Arquivos Selecionados",
    removeAll: "Remover Todos",
    uploading: "Enviando",
    upload: "Enviar",
    file: "arquivo",
    filesPlural: "arquivos",
    pleaseSelectFile: "Selecione pelo menos um arquivo para enviar",
    onlyImagesAndPdf:
      "Apenas imagens (JPEG, PNG, GIF, WebP) e arquivos PDF são permitidos",
    fileTooLarge: "Arquivo muito grande. Tamanho máximo é",
    maximumFilesAllowed: "Máximo",
    filesAllowed: "arquivos permitidos",
    fileUploadedSuccessfully: "enviado com sucesso",
    filesUploadedSuccessfully: "arquivos enviados com sucesso",
    failedToUpload: "Falha ao enviar arquivos",
  },
  en: {
    fileSelected: "File Selected",
    filesSelected: "Files Selected",
    dropFilesHere: "Drag & drop your files here",
    dropFilesHereActive: "Drop the files here",
    fileTypeNotSupported: "File type not supported",
    clickToBrowse: "click to browse",
    or: "or",
    each: "each",
    fileTypesDescription: "Images (JPEG, PNG, GIF, WebP) and PDF files up to",
    maximumFiles: "Maximum",
    files: "files",
    selectedFiles: "Selected Files",
    removeAll: "Remove All",
    uploading: "Uploading",
    upload: "Upload",
    file: "file",
    filesPlural: "files",
    pleaseSelectFile: "Please select at least one file to upload",
    onlyImagesAndPdf:
      "Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed",
    fileTooLarge: "File too large. Maximum size is",
    maximumFilesAllowed: "Maximum",
    filesAllowed: "files allowed",
    fileUploadedSuccessfully: "uploaded successfully",
    filesUploadedSuccessfully: "files uploaded successfully",
    failedToUpload: "Failed to upload files",
  },
};

export default function FileUpload({
  config = {},
  language = "pt-br",
  onUploadSuccess,
  onUploadError,
  onFilesChange,
  initialFileIds = [],
  className,
  projectId,
  sprintId,
  docId,
  taskId,
}: {
  config?: FileUploadConfig;
  language?: Language;
  onUploadSuccess?: (results: unknown[]) => void;
  onUploadError?: (error: Error) => void;
  onFilesChange?: (fileIds: string[]) => void;
  initialFileIds?: string[];
  className?: string;
  projectId?: string;
  sprintId?: string;
  docId?: string;
  taskId?: string;
}) {
  const finalConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config]
  );
  const t = TRANSLATIONS[language];
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFileIds, setUploadedFileIds] =
    useState<string[]>(initialFileIds);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadFileMutation = useMutation({
    mutationFn: async (files: File[]) => {
      // Track which files are being uploaded
      setUploadingFiles(files);

      const results = [];
      for (const file of files) {
        const formData = new FormData();

        if (projectId) formData.append("projectId", projectId);
        if (sprintId) formData.append("sprintId", sprintId);
        if (docId) formData.append("docId", docId);
        if (taskId) formData.append("taskId", taskId);

        // Extract image dimensions on client side
        if (file.type.startsWith("image/")) {
          if (file.type !== "image/webp") {
            const compressedFile = await compressAndConvertToWebP({ file });

            if (!compressedFile) {
              throw new Error("Failed to compress image");
            }

            console.log("compressedFile Original Size:", file.size);
            console.log("compressedFile Compressed Size:", compressedFile.size);

            formData.append("file", compressedFile);
          }

          const { width, height } = await getImageDimensions(file);

          if (!width || !height) {
            throw new Error("Failed to get image dimensions");
          }

          formData.append("width", width.toString());
          formData.append("height", height.toString());
        }

        const result = await uploadImage(formData);

        if (!result.isSuccess) {
          throw new Error(result.error || "Upload failed");
        }
        results.push(result);
      }
      return results;
    },
    onSuccess: (results) => {
      const count = results.length;
      if (count === 1) {
        toast.success(
          `"${results[0].data?.originalName || "File"}" ${
            t.fileUploadedSuccessfully
          }`
        );
      } else {
        toast.success(`${count} ${t.filesUploadedSuccessfully}`);
      }

      // Extract file IDs from results and update state
      const newFileIds = results
        .map((result) => result.data?.id)
        .filter((id): id is string => Boolean(id));
      const updatedFileIds = [...uploadedFileIds, ...newFileIds];
      setUploadedFileIds(updatedFileIds);
      onFilesChange?.(updatedFileIds);

      // Remove successfully uploaded files from selectedFiles and uploadingFiles
      setSelectedFiles((prev) =>
        prev.filter(
          (file) =>
            !results.some((result) => result.data?.originalName === file.name)
        )
      );
      setUploadingFiles([]);
      setError(null);
      onUploadSuccess?.(results);
    },
    onError: (error: Error) => {
      setUploadingFiles([]);
      toast.error(error.message || t.failedToUpload);
      onUploadError?.(error);
    },
  });

  const validateFile = useCallback(
    (file: File) => {
      // Validate file type
      if (!finalConfig.allowedTypes.includes(file.type)) {
        return t.onlyImagesAndPdf;
      }

      // Validate file size
      if (file.size > finalConfig.maxFileSize) {
        return `${t.fileTooLarge} ${finalConfig.maxFileSize / (1024 * 1024)}MB`;
      }

      return null;
    },
    [finalConfig, t]
  );

  const validateFiles = useCallback(
    (files: File[]) => {
      // Check total file count
      if (files.length > finalConfig.maxFiles) {
        return `${t.maximumFilesAllowed} ${finalConfig.maxFiles} ${t.filesAllowed}`;
      }

      // Validate each file
      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          return error;
        }
      }

      return null;
    },
    [finalConfig.maxFiles, validateFile, t]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setError(null);

      // Combine with existing files if multiple is enabled
      const newFiles = finalConfig.multiple
        ? [...selectedFiles, ...acceptedFiles]
        : acceptedFiles;
      const validationError = validateFiles(newFiles);

      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFiles(newFiles);

      // Automatically start uploading the new files
      uploadFileMutation.mutate(acceptedFiles);
    },
    [selectedFiles, validateFiles, finalConfig.multiple, uploadFileMutation]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: finalConfig.accept,
      maxSize: finalConfig.maxFileSize,
      multiple: finalConfig.multiple,
      maxFiles: finalConfig.maxFiles,
      noClick: uploadFileMutation.isPending,
      noKeyboard: uploadFileMutation.isPending,
      disabled: uploadFileMutation.isPending,
    });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const removeUploadedFile = (fileId: string) => {
    const updatedFileIds = uploadedFileIds.filter((id) => id !== fileId);
    setUploadedFileIds(updatedFileIds);
    onFilesChange?.(updatedFileIds);
  };

  const removeAllFiles = () => {
    setSelectedFiles([]);
    setUploadedFileIds([]);
    onFilesChange?.([]);
    setError(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <File className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-red-500" />;
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          uploadFileMutation.isPending
            ? "border-primary bg-primary/5 cursor-not-allowed"
            : "cursor-pointer hover:border-primary/50 hover:bg-muted/50",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          error && "border-destructive",
          selectedFiles.length > 0 &&
            !uploadFileMutation.isPending &&
            "border-green-500 bg-green-50 dark:bg-green-950"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          {uploadFileMutation.isPending ? (
            <>
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-primary">
                  {t.uploading} {selectedFiles.length}{" "}
                  {selectedFiles.length === 1 ? t.file : t.filesPlural}...
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.uploading} {selectedFiles.length}/{finalConfig.maxFiles}{" "}
                  {t.files}
                </p>
              </div>
            </>
          ) : selectedFiles.length > 0 ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-green-700 dark:text-green-300">
                  {selectedFiles.length === 1
                    ? t.fileSelected
                    : `${selectedFiles.length} ${t.filesSelected}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length}/{finalConfig.maxFiles} {t.files}
                </p>
              </div>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "p-4 rounded-full transition-colors",
                  isDragActive && !isDragReject && "bg-primary/10",
                  isDragReject && "bg-destructive/10",
                  !isDragActive && "bg-muted"
                )}
              >
                {isDragReject ? (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive && !isDragReject && t.dropFilesHereActive}
                  {isDragReject && t.fileTypeNotSupported}
                  {!isDragActive && t.dropFilesHere}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.or}{" "}
                  <span className="text-primary font-medium">
                    {t.clickToBrowse}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.fileTypesDescription}{" "}
                  {formatFileSize(finalConfig.maxFileSize)}MB {t.each}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.maximumFiles} {finalConfig.maxFiles} {t.files}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* File List */}
      {(selectedFiles.length > 0 ||
        uploadingFiles.length > 0 ||
        uploadedFileIds.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {t.selectedFiles} (
              {selectedFiles.length +
                uploadingFiles.length +
                uploadedFileIds.length}
              )
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeAllFiles}
              className="text-muted-foreground hover:text-destructive"
              disabled={uploadFileMutation.isPending}
            >
              {t.removeAll}
            </Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* Uploading files */}
            {uploadingFiles.map((file, index) => (
              <div
                key={`uploading-${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20"
              >
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4 text-primary animate-pulse" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.uploading}... ({formatFileSize(file.size)}MB)
                    </p>
                  </div>
                </div>
                <div className="text-xs text-primary">{t.uploading}</div>
              </div>
            ))}

            {/* Selected files (not yet uploaded) */}
            {selectedFiles.map((file, index) => (
              <div
                key={`selected-${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive"
                  disabled={uploadFileMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Uploaded files */}
            {uploadedFileIds.map((fileId, index) => (
              <div
                key={`uploaded-${fileId}`}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">File {index + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.fileUploadedSuccessfully}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUploadedFile(fileId)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
