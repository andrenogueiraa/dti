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
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Note: Image dimensions are now extracted on the client side
// and passed via form data to avoid server-side image processing

export async function uploadImage(formData: FormData) {
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

  const image = formData.get("file") as File;
  const projectId = formData.get("projectId") as string | null;
  const sprintId = formData.get("sprintId") as string | null;
  const docId = formData.get("docId") as string | null;
  const taskId = formData.get("taskId") as string | null;

  if (!image) {
    return {
      isSuccess: false,
      isError: true,
      data: null,
      error: "No file provided",
    };
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(image.type)) {
    return {
      isSuccess: false,
      isError: true,
      data: null,
      error: "Invalid file type. Only images (JPEG, PNG, GIF, WebP).",
    };
  }

  // Validate file size
  if (image.size > MAX_FILE_SIZE) {
    return {
      isSuccess: false,
      isError: true,
      data: null,
      error: `File too large. Maximum size is ${
        MAX_FILE_SIZE / (1024 * 1024)
      }MB.`,
    };
  }

  // Generate unique filename
  const fileExtension = image.name.split(".").pop() || "";
  const uniqueFilename = `${uuidv7()}.${fileExtension}`;

  // Create date-based folder structure (YYYY/MM/DD)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // Full path: YYYY/MM/DD/uuidv7.extension (for Supabase storage)
  const filePath = `images/${year}/${month}/${day}/${uniqueFilename}`;

  // Convert file to buffer
  const buffer = Buffer.from(await image.arrayBuffer());

  if (!buffer) {
    return {
      isSuccess: false,
      isError: true,
      data: null,
      error: "Failed to convert file to buffer",
    };
  }

  // Upload to Supabase storage
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
    Body: buffer,
    ContentType: image.type,
    ContentLength: image.size,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("Upload error:", error);
    return {
      isSuccess: false,
      isError: true,
      data: null,
      error: "Failed to upload file to S3",
    };
  }

  // Generate signed URL
  const { data: signedUrl } = await getFileSignedUrl({
    path: filePath,
    expiresIn: 60 * 60 * 24,
  });

  if (!signedUrl) {
    return {
      isSuccess: false,
      isError: true,
      data: null,
      error: "Failed to generate signed URL",
    };
  }

  // Get image dimensions from form data (extracted on client side)
  const widthParam = formData.get("width") as string;
  const heightParam = formData.get("height") as string;
  const width = widthParam ? parseInt(widthParam) : null;
  const height = heightParam ? parseInt(heightParam) : null;

  const [insertedImage] = await db
    .insert(images)
    .values({
      name: uniqueFilename,
      path: filePath,
      originalName: image.name,
      size: image.size,
      type: image.type,
      width,
      height,
      url: signedUrl,
      createdBy: userId,
      projectId,
      sprintId,
      docId,
      taskId,
    })
    .returning();

  if (!insertedImage) {
    return {
      isSuccess: false,
      isError: true,
      data: null,
      error: "Failed to insert image into database",
    };
  }

  return {
    isSuccess: true,
    isError: false,
    data: insertedImage,
    error: null,
  };
}

// Function to generate signed URL for a file
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

    return {
      isSuccess: true,
      isError: false,
      data: signedUrl,
      error: null,
    };
  } catch (error) {
    console.error("Get signed URL error:", error);
    return {
      isSuccess: false,
      isError: true,
      data: null,
      error: "Failed to generate file URL",
    };
  }
}
