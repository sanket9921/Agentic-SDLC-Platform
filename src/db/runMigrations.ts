import fs from "fs/promises";
import path from "path";
import { pool } from "./db";

async function runMigrations() {
  try {
    const migrationsPath = path.join(__dirname, "../migrations");

    const files = await fs.readdir(migrationsPath);
    const sqlFiles = files.filter(f => f.endsWith(".sql")).sort();

    for (const file of sqlFiles) {
      const fullPath = path.join(migrationsPath, file);
      const sql = await fs.readFile(fullPath, "utf-8");

      console.log(`Running migration: ${file}`);
      await pool.query(sql);
    }

    console.log("All migrations completed.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigrations();