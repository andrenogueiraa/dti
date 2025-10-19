import imageCompression from "browser-image-compression";

export async function compressAndConvertToWebP({
  file,
  maxSizeMB = 1,
  maxWidthOrHeight = 1920,
  useWebWorker = true,
  fileType = "image/webp",
  initialQuality = 0.8,
}: {
  file: File;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker,
    fileType,
    initialQuality,
  };

  return await imageCompression(file, options);
}

export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const image = new Image();
  image.src = URL.createObjectURL(file);
  await new Promise((resolve) => {
    image.onload = () => resolve(null);
  });
  return { width: image.width, height: image.height };
}
