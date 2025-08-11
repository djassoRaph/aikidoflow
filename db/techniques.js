import { openDatabase } from './db';

const db = openDatabase();

// Create the techniques table if it doesn't exist
export const createTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS techniques (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        technique TEXT NOT NULL,
        note TEXT,
        date TEXT NOT NULL
      );`
    );
  });
};

// Insert a new technique
export const insertTechnique = (technique, note, date, successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO techniques (technique, note, date) values (?, ?, ?)',
      [technique, note, date],
      (_, result) => successCallback(result),
      (_, error) => errorCallback(error)
    );
  });
};

// Fetch all techniques
export const fetchTechniques = (successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM techniques ORDER BY date DESC',
      [],
      (_, { rows: { _array } }) => successCallback(_array),
      (_, error) => errorCallback(error)
    );
  });
};

// Delete a technique by id
export const deleteTechnique = (id, successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM techniques WHERE id = ?',
      [id],
      (_, result) => successCallback(result),
      (_, error) => errorCallback(error)
    );
  });
}; 