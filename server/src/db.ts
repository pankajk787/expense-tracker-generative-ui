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
        
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            color TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            category_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
        
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            frequency TEXT DEFAULT 'monthly',
            start_date TEXT,
            end_date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
            UNIQUE(user_id, category_id)
        )`
    );

  // Initialize default categories if they don't exist
  const defaultCategories = [
    { name: "Groceries", color: "#10b981" },
    { name: "Dining", color: "#f59e0b" },
    { name: "Transportation", color: "#3b82f6" },
    { name: "Utilities", color: "#8b5cf6" },
    { name: "Entertainment", color: "#ec4899" },
    { name: "Healthcare", color: "#ef4444" },
    { name: "Shopping", color: "#06b6d4" },
    { name: "Other", color: "#6b7280" }
  ];

  const insertStmt = database.prepare(
    `INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)`
  );
  
  for (const category of defaultCategories) {
    insertStmt.run(category.name, category.color);
  }

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
