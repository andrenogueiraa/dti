#!/usr/bin/env tsx
/**
 * Database Restore Script
 * Restores a database from a backup file
 *
 * Usage:
 *   npm run db:restore -- <backup-file>
 *   npm run db:restore -- backups/mydb_local_2025-01-07_12-30-00.sql
 */

import { config } from "dotenv";
import { execSync } from "child_process";
import { existsSync, readdirSync, statSync } from "fs";
import { resolve, join } from "path";
import * as readline from "readline";

// Load environment variables from .env file
config();

// Parse command line arguments
const args = process.argv.slice(2);
const backupFile = args[0];

let filepath: string;

if (!backupFile) {
  // No file provided - show interactive selector
  const backupsDir = join(process.cwd(), "backups");

  if (!existsSync(backupsDir)) {
    console.error("❌ Backups directory not found");
    console.error("\nCreate a backup first:");
    console.error("  npm run db:backup");
    process.exit(1);
  }

  // Get all .sql files in backups directory
  const backupFiles = readdirSync(backupsDir)
    .filter((file) => file.endsWith(".sql"))
    .map((file) => {
      const fullPath = join(backupsDir, file);
      const stats = statSync(fullPath);
      return {
        name: file,
        path: fullPath,
        size: (stats.size / (1024 * 1024)).toFixed(2),
        date: stats.mtime,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime()); // Most recent first

  if (backupFiles.length === 0) {
    console.error("❌ No backup files found in backups/");
    console.error("\nCreate a backup first:");
    console.error("  npm run db:backup");
    process.exit(1);
  }

  console.log("\n📦 Available backups:\n");
  backupFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.name}`);
    console.log(`     Size: ${file.size} MB | Date: ${file.date.toLocaleString()}\n`);
  });

  // Ask user to select
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`Select a backup (1-${backupFiles.length}) or 'q' to quit: `, (answer) => {
    rl.close();

    if (answer.toLowerCase() === "q") {
      console.log("\n❌ Restore cancelled");
      process.exit(0);
    }

    const selection = parseInt(answer);
    if (isNaN(selection) || selection < 1 || selection > backupFiles.length) {
      console.error("\n❌ Invalid selection");
      process.exit(1);
    }

    filepath = backupFiles[selection - 1].path;
    continueRestore();
  });
} else {
  // File provided via command line
  filepath = resolve(backupFile);

  if (!existsSync(filepath)) {
    console.error(`❌ Backup file not found: ${filepath}`);
    process.exit(1);
  }

  continueRestore();
}

function continueRestore() {

  // Get database URL from environment (try both DATABASE_URL and POSTGRES_URL)
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    console.error(
      "❌ DATABASE_URL or POSTGRES_URL environment variable is not set"
    );
    process.exit(1);
  }

  // Parse POSTGRES_URL to extract database name
  // Format: postgres://user:password@host:port/database or postgresql://...
  const urlMatch = databaseUrl.match(
    /postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(\?.*)?$/
  );

  if (!urlMatch) {
    console.error("❌ Invalid POSTGRES_URL format");
    console.error("Expected: postgres://user:password@host:port/database");
    process.exit(1);
  }

  const [, , , , , database] = urlMatch;

  // Strip query parameters for psql (it doesn't support custom params like supa=base-pooler.x)
  const connectionUrl = databaseUrl.split("?")[0];

  console.log(`\n⚠️  WARNING: This will restore the database from a backup`);
  console.log(`   Database: ${database}`);
  console.log(`   Connection: ${connectionUrl.replace(/:[^:@]+@/, ":****@")}`); // Hide password
  console.log(`   Backup: ${filepath}`);
  console.log(`\n   This operation will DROP existing tables and data!`);

  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nAre you sure you want to continue? (yes/no): ", (answer) => {
    rl.close();

    if (answer.toLowerCase() !== "yes") {
      console.log("\n❌ Restore cancelled");
      process.exit(0);
    }

    console.log(`\n📦 Starting database restore...\n`);

    try {
      // Execute psql using connection string without query params
      const command = `psql`;
      const psqlArgs = [
        `"${connectionUrl}"`, // Use connection string without query params
        `-f "${filepath}"`,
      ].join(" ");

      execSync(`${command} ${psqlArgs}`, {
        stdio: "inherit",
      });

      console.log(`\n✅ Restore completed successfully!\n`);
    } catch (error) {
      console.error("\n❌ Restore failed:", error);
      process.exit(1);
    }
  });
}

