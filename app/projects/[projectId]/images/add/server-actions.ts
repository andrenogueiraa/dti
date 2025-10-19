"use server";

import { db } from "@/drizzle";
import { images } from "@/drizzle/core-schema";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { uuidv7 } from "uuidv7";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// Configure S3 client for Supabase storage
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for Supabase
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Note: Image dimensions are now extracted on the client side
// and passed via form data to avoid server-side image processing

export async function validateImage(image: File) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (
    ![
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ].includes(image.type)
  ) {
    throw new Error("Formato de arquivo inválido.");
  }

  if (image.size > MAX_FILE_SIZE) {
    throw new Error(
      `Arquivo muito grande. Tamanho máximo é de ${
        MAX_FILE_SIZE / (1024 * 1024)
      }MB.`
    );
  }

  return image;
}

export async function getFileMetadata({ file }: { file: File }) {
  // Generate unique filename
  const fileExtension = file.name.split(".").pop() || "";
  const uniqueFilename = `${uuidv7()}.${fileExtension}`;

  // Create date-based folder structure (YYYY/MM/DD)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // Full path: YYYY/MM/DD/uuidv7.extension (for Supabase storage)
  const path = `images/${year}/${month}/${day}/${uniqueFilename}`;

  // Convert file to buffer and then to base64 for serialization
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Buffer = buffer.toString("base64");

  if (!buffer) {
    throw new Error("Failed to convert file to buffer");
  }

  const imageWithAttributes = {
    buffer: base64Buffer,
    name: uniqueFilename,
    path,
    type: file.type,
    size: file.size,
  };

  return imageWithAttributes;
}

export async function uploadFileToS3({
  buffer,
  path,
  type,
  size,
}: {
  buffer: string; // Now expecting base64 string
  path: string;
  type: string;
  size: number;
}) {
  // Convert base64 string back to Buffer
  const bufferData = Buffer.from(buffer, "base64");

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
    Body: bufferData,
    ContentType: type,
    ContentLength: size,
  });

  try {
    await s3Client.send(command);
    return {
      isSuccess: true,
      isError: false,
      data: null,
      error: null,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      isSuccess: false,
      isError: true,
      data: null,
      error: "Failed to upload file to S3",
    };
  }
}

export async function createImageOnDatabase({
  uniqueFilename,
  path,
  originalName,
  size,
  type,
  width,
  height,
  projectId,
  sprintId = null,
  docId = null,
  taskId = null,
}: {
  uniqueFilename: string;
  path: string;
  originalName: string;
  size: number;
  type: string;
  width: number;
  height: number;
  projectId: string;
  sprintId?: string | null;
  docId?: string | null;
  taskId?: string | null;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      isSuccess: false,
      isError: true,
      data: null,
      error: "Unauthorized",
    };
  }

  const userId = session.user.id;

  console.log("creating-image-on-database", {
    uniqueFilename,
    path,
    originalName,
    size,
    type,
    width,
    height,
  });

  try {
    const [insertedImage] = await db
      .insert(images)
      .values({
        name: uniqueFilename,
        path,
        originalName,
        size,
        type,
        width,
        height,
        createdBy: userId,
        projectId,
        sprintId: sprintId || null,
        docId: docId || null,
        taskId: taskId || null,
      })
      .returning({ id: images.id });

    if (!insertedImage) {
      throw new Error("Failed to insert image into database");
    }
    return insertedImage;
  } catch (error) {
    console.error("Create image on database error:", error);
    throw new Error("Failed to insert image into database");
  }
}

export async function getFileSignedUrl({
  path,
  expiresIn,
}: {
  path: string;
  expiresIn?: number;
}) {
  try {
    // Generate signed URL (valid for 1 hour)
    const getObjectCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
    });

    // Import getSignedUrl dynamically to avoid build issues
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn,
    });

    return signedUrl;
  } catch (error) {
    console.error("Get signed URL error:", error);
    throw new Error("Failed to generate file URL");
  }
}

export async function updateImageUrlOnDatabase({
  imageId,
  url,
  urlExpiresAt,
}: {
  imageId: string;
  url: string;
  urlExpiresAt: Date;
}) {
  return await db
    .update(images)
    .set({ url, urlExpiresAt })
    .where(eq(images.id, imageId))
    .returning({ id: images.id });
}
