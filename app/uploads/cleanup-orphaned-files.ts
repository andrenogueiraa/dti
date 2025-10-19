"use server";

import { db } from "@/drizzle";
import { files } from "@/drizzle/core-schema";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, lt } from "drizzle-orm";

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

const BUCKET_NAME = "DTI Bucket";

export async function cleanupOrphanedFiles() {
  try {
    // Find files with uploadStatus = 'pending' older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const orphanedFiles = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.uploadStatus, "pending"),
          lt(files.createdAt, twentyFourHoursAgo)
        )
      );

    console.log(`Found ${orphanedFiles.length} orphaned files to clean up`);

    const results = {
      markedOrphaned: 0,
      deletedFromS3: 0,
      errors: [] as string[],
    };

    for (const file of orphanedFiles) {
      try {
        // Mark as orphaned in database (for audit trail)
        await db
          .update(files)
          .set({ uploadStatus: "orphaned" })
          .where(eq(files.id, file.id));

        results.markedOrphaned++;

        // Delete from S3 storage
        const deleteCommand = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.path,
        });

        await s3Client.send(deleteCommand);
        results.deletedFromS3++;

        console.log(`Cleaned up file: ${file.originalName} (${file.id})`);
      } catch (error) {
        const errorMsg = `Failed to clean up file ${file.id}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log(`Cleanup completed:`, results);
    return {
      isSuccess: true,
      data: results,
      error: null,
    };
  } catch (error) {
    console.error("Cleanup error:", error);
    return {
      isSuccess: false,
      data: null,
      error: "Failed to cleanup orphaned files",
    };
  }
}

// Optional: Function to delete orphaned files from database (after S3 cleanup)
export async function deleteOrphanedFilesFromDB() {
  try {
    const deletedFiles = await db
      .delete(files)
      .where(eq(files.uploadStatus, "orphaned"))
      .returning();

    console.log(`Deleted ${deletedFiles.length} orphaned files from database`);

    return {
      isSuccess: true,
      data: { deletedCount: deletedFiles.length },
      error: null,
    };
  } catch (error) {
    console.error("Delete orphaned files from DB error:", error);
    return {
      isSuccess: false,
      data: null,
      error: "Failed to delete orphaned files from database",
    };
  }
}
