import { db } from "@/drizzle";
import { images } from "@/drizzle/core-schema";
import { auth } from "@/lib/auth";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { uuidv7 } from "uuidv7";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      {
        isSuccess: false,
        isError: true,
        data: null,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  // 1. get file from request
  const file = await request.formData();

  const image = file.get("image") as File;
  const width = Number(file.get("width") as string);
  const height = Number(file.get("height") as string);
  const projectId = file.get("projectId") as string | null;
  const sprintId = file.get("sprintId") as string | null;
  const docId = file.get("docId") as string | null;
  const taskId = file.get("taskId") as string | null;

  if (!image) {
    return NextResponse.json(
      { isSuccess: false, isError: true, data: null, error: "Image not found" },
      { status: 400 }
    );
  }

  // 2. validate file size and type (< 5mb and common image formats)
  if (image.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      {
        isSuccess: false,
        isError: true,
        data: null,
        error: "File size exceeds 5MB",
      },
      { status: 400 }
    );
  }

  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (!allowedImageTypes.includes(image.type)) {
    return NextResponse.json(
      {
        isSuccess: false,
        isError: true,
        data: null,
        error: "File type must be JPEG, PNG, GIF, or WebP",
      },
      { status: 400 }
    );
  }

  // Generate attributes for the image
  const type = image.type;
  const size = image.size;
  const fileExtension = image.name.split(".").pop() || "";
  const uniqueFilename = `${uuidv7()}.${fileExtension}`;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const path = `images/${year}/${month}/${day}/${uniqueFilename}`;

  // Convert file to buffer and then to base64 for serialization
  const bufferData = Buffer.from(await image.arrayBuffer());

  if (!bufferData) {
    return NextResponse.json(
      {
        isSuccess: false,
        isError: true,
        data: null,
        error: "Buffer data not found",
      },
      { status: 500 }
    );
  }

  // Upload file to s3 (using supabase storage)
  const bucketName = process.env.S3_BUCKET_NAME;
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION;
  const accessKeyId = process.env.ACCESS_KEY_ID;
  const secretAccessKey = process.env.SECRET_ACCESS_KEY;

  if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucketName) {
    return NextResponse.json(
      {
        isSuccess: false,
        isError: true,
        data: null,
        error: "S3 credentials not found",
      },
      { status: 500 }
    );
  }

  const s3Client = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true, // Required for Supabase
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: path,
    Body: bufferData,
    ContentType: type,
    ContentLength: size,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        isSuccess: false,
        isError: true,
        data: null,
        error: "Failed to upload file to S3",
      },
      { status: 500 }
    );
  }

  // Generate public URL from S3 bucket endpoint and file path (bucket is now public)
  const publicUrl = `${endpoint}/${bucketName}/${path}`;

  // Create database record

  let insertedImage;
  try {
    const result = await db
      .insert(images)
      .values({
        name: uniqueFilename,
        originalName: image.name,
        path,
        type,
        size,
        url: publicUrl,
        width,
        height,
        createdBy: userId,
        projectId,
        sprintId,
        docId,
        taskId,
      })
      .returning({
        id: images.id,
      });

    [insertedImage] = result;
  } catch (error) {
    console.error("Database insert error:", error);
    return NextResponse.json(
      {
        isSuccess: false,
        isError: true,
        data: null,
        error: "Failed to create image record in database",
      },
      { status: 500 }
    );
  }

  if (!insertedImage) {
    return NextResponse.json(
      {
        isSuccess: false,
        isError: true,
        data: null,
        error: "Failed to create image record",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    isSuccess: true,
    isError: false,
    data: insertedImage,
    error: null,
  });
}
