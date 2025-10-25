import imageCompression from "browser-image-compression";

export async function compressAndConvertToWebP({
  file,
  maxSizeMB = 5,
  maxWidthOrHeight,
  useWebWorker = true,
  fileType = "image/webp",
  initialQuality = 1.0,
}: {
  file: File;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}): Promise<File> {
  // Calculate maxWidthOrHeight if not provided (1080px max, or original if smaller)
  let calculatedMaxWidth = maxWidthOrHeight;
  if (!calculatedMaxWidth) {
    const { width: originalWidth } = await getImageDimensions(file);
    calculatedMaxWidth = Math.min(originalWidth, 1080);
  }

  const options = {
    maxSizeMB,
    maxWidthOrHeight: calculatedMaxWidth,
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
