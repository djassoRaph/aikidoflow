import { openDatabaseAsync, SQLiteAsyncDatabase } from 'expo-sqlite/next';

export interface Log {
  id?: number;
  technique_name: string;
  notes: string;
  teacher: string;
  partner?: string | null;
  date: string; // ISO format
  source: 'voice' | 'manual';
}

let db: SQLiteAsyncDatabase;

export async function initDb(): Promise<void> {
  db = await openDatabaseAsync('aikido_logs.db');
  const tx = await db.createTransaction();
  await tx.executeSqlAsync(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      technique_name TEXT NOT NULL,
      notes TEXT NOT NULL,
      teacher TEXT NOT NULL,
      partner TEXT,
      date TEXT NOT NULL,
      source TEXT NOT NULL
    );
  `);
  await tx.commitAsync();
  console.log('[SQLite] logs table ready');
}

export async function insertLog(log: Log): Promise<void> {
  const tx = await db.createTransaction();
  await tx.executeSqlAsync(
    `INSERT INTO logs (technique_name, notes, teacher, partner, date, source) VALUES (?, ?, ?, ?, ?, ?);`,
    [log.technique_name, log.notes, log.teacher, log.partner ?? null, log.date, log.source]
  );
  await tx.commitAsync();
  console.log('[SQLite] inserted log');
}

export async function getAllLogs(): Promise<Log[]> {
  const tx = await db.createTransaction();
  const result = await tx.executeSqlAsync(`SELECT * FROM logs ORDER BY date DESC;`);
  await tx.commitAsync();
  return result.rows as Log[];
}

export async function deleteLog(id: number): Promise<void> {
  const tx = await db.createTransaction();
  await tx.executeSqlAsync(`DELETE FROM logs WHERE id = ?;`, [id]);
  await tx.commitAsync();
  console.log('[SQLite] deleted log ID:', id);
}

export async function searchLogs(query: string): Promise<Log[]> {
  const tx = await db.createTransaction();
  const result = await tx.executeSqlAsync(
    `SELECT * FROM logs WHERE technique_name LIKE ? OR notes LIKE ? ORDER BY date DESC;`,
    [`%${query}%`, `%${query}%`]
  );
  await tx.commitAsync();
  return result.rows as Log[];
}
