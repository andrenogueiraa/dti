#!/usr/bin/env tsx
/**
 * Database Backup Script
 * Creates a timestamped backup of the PostgreSQL database
 *
 * Usage:
 *   npm run db:backup              # Backup local database
 *   npm run db:backup -- --prod    # Backup production database
 */

import { config } from "dotenv";
import { execSync } from "child_process";
import { existsSync, mkdirSync, statSync } from "fs";
import { join } from "path";

// Load environment variables from .env file
config();

// Parse command line arguments
const args = process.argv.slice(2);
const isProduction = args.includes("--prod") || args.includes("-p");

// Get database URL from environment (try both DATABASE_URL and POSTGRES_URL)
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error(
    "❌ DATABASE_URL or POSTGRES_URL environment variable is not set"
  );
  process.exit(1);
}

// Parse DATABASE_URL to extract database name
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

// Create backups directory if it doesn't exist
const backupsDir = join(process.cwd(), "backups");
if (!existsSync(backupsDir)) {
  mkdirSync(backupsDir, { recursive: true });
  console.log("✓ Created backups directory");
}

// Generate filename with timestamp
const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-")
  .replace("T", "_")
  .split("Z")[0];
const environment = isProduction ? "prod" : "local";
const filename = `${database}_${environment}_${timestamp}.sql`;
const filepath = join(backupsDir, filename);

// Strip query parameters for pg_dump (it doesn't support custom params like supa=base-pooler.x)
const connectionUrl = databaseUrl.split("?")[0];

console.log(`\n📦 Starting database backup...`);
console.log(`   Database: ${database}`);
console.log(`   Connection: ${connectionUrl.replace(/:[^:@]+@/, ":****@")}`); // Hide password
console.log(`   Environment: ${environment}`);
console.log(`   File: ${filename}\n`);

try {
  // Execute pg_dump using connection string without query params
  const command = `pg_dump`;
  const pgDumpArgs = [
    `"${connectionUrl}"`, // Use connection string without query params
    `-F p`, // Plain text format
    `--clean`, // Include DROP commands
    `--if-exists`, // Use IF EXISTS when dropping
    `--no-owner`, // Don't include ownership commands
    `--no-acl`, // Don't include access privileges
    `-f "${filepath}"`,
  ].join(" ");

  execSync(`${command} ${pgDumpArgs}`, {
    stdio: "inherit",
  });

  console.log(`\n✅ Backup completed successfully!`);
  console.log(`   Location: ${filepath}`);
  console.log(`   Size: ${getFileSizeMB(filepath)} MB\n`);

  // Show additional backup info
  console.log(`💡 To restore this backup, use:`);
  console.log(`   psql -h <host> -U <user> -d <database> -f "${filepath}"\n`);
} catch (error) {
  console.error("\n❌ Backup failed:", error);
  process.exit(1);
}

function getFileSizeMB(filepath: string): string {
  try {
    const stats = statSync(filepath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  } catch {
    return "unknown";
  }
}
