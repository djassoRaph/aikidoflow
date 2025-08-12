import * as SQLite from 'expo-sqlite';

// Open a connection to the SQLite database
export const openDatabase = () => {
  const db = SQLite.openDatabase('aikidoFlow.db');
  return db;
}; 