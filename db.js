import sqlite3 from "sqlite3";
import { database } from "./config";

const sql = sqlite3.verbose();
const db = new sql.Database(database);

const start = block => db.serialize(block);
const close = () => db.close();

const insertImage = ({ timestamp, title, filename, type, sizes }) => {
  db.run(
    "INSERT INTO images (timestamp, title, filename, type, sizes) VALUES (?, ?, ?, ?, ?)",
    [timestamp, title, filename, type, sizes]
  );
};

export default {
  sql: db,
  start,
  close,
  insertImage
};