import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('aikidoflow.db');
  await _db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      technique TEXT NOT NULL,
      notes TEXT,
      source TEXT,
      teacher TEXT
    );
  `);
  return _db;
}

export type LogRow = {
  id: number;
  date: string;
  technique: string;
  notes: string | null;
  source: string | null;
  teacher: string | null;
};

export async function insertLog(entry: {
  date: string;
  technique: string;
  notes?: string;
  source?: string;
  teacher?: string;
}) {
  const db = await getDb();
  const res = await db.runAsync(
    `INSERT INTO logs (date, technique, notes, source, teacher) VALUES (?, ?, ?, ?, ?)`,
    entry.date,
    entry.technique,
    entry.notes ?? null,
    entry.source ?? null,
    entry.teacher ?? null
  );
  return res.lastInsertRowId;
}

export async function getLogs(limit = 50): Promise<LogRow[]> {
  const db = await getDb();
  return db.getAllAsync<LogRow>(
    `SELECT * FROM logs ORDER BY date DESC, id DESC LIMIT ?`,
    [limit]
  );
}
