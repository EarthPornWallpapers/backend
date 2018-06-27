import db from "../src/db";

db.start(() => {
  db.sql.run(`CREATE TABLE images (
    id	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    timestamp	INTEGER NOT NULL,
    title	TEXT NOT NULL,
    author	TEXT,
    reddit_username	TEXT NOT NULL,
    reddit_thread	TEXT NOT NULL,
    filename	TEXT NOT NULL UNIQUE,
    type	TEXT NOT NULL,
    sizes	TEXT NOT NULL);
  `);
});

db.close();
