import { DatabaseSync } from "node:sqlite";

export function initDB(dbPath: string): DatabaseSync {
  const database = new DatabaseSync(dbPath);

  database.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    );

  // // Migration: Add user_id column if it doesn't exist
  // try {
  //   database.exec(`
  //     ALTER TABLE expenses ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;
  //   `);
  // } catch (error) {
  //   // Column already exists, ignore the error
  //   if (!(error instanceof Error && error.message.includes("duplicate column name"))) {
  //     console.log("Migration: user_id column already exists or other migration status");
  //   }
  // }

  return database;
}
