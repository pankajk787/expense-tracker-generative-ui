import { DatabaseSync } from "node:sqlite";

export function initDB(dbPath: string): DatabaseSync {
  const database = new DatabaseSync(dbPath);

  database.exec(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL
        )`
    );

  return database;
}
