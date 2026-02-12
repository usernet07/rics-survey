import Database from 'better-sqlite3';

export function initDb(dbPath: string): Database.Database {
  const db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      reference TEXT,
      surveyDate TEXT,
      reportDate TEXT,
      clientName TEXT,
      propertyAddress TEXT,
      propertyType TEXT,
      constructionType TEXT,
      approximateAge TEXT,
      approximateArea TEXT,
      tenure TEXT,
      weather TEXT,
      orientation TEXT,
      accommodation TEXT,
      garageOutbuildings TEXT,
      status TEXT DEFAULT 'draft',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS captures (
      id TEXT PRIMARY KEY,
      surveyId TEXT NOT NULL,
      sectionId TEXT NOT NULL,
      conditionRating TEXT,
      construction TEXT,
      observations TEXT,
      meaning TEXT,
      recommendations TEXT,
      standardText TEXT,
      audioNotes TEXT,
      fieldData TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(surveyId, sectionId),
      FOREIGN KEY (surveyId) REFERENCES surveys(id)
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      captureId TEXT,
      surveyId TEXT NOT NULL,
      sectionId TEXT,
      filename TEXT NOT NULL,
      originalName TEXT,
      description TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (surveyId) REFERENCES surveys(id)
    );

    CREATE TABLE IF NOT EXISTS repair_costs (
      id TEXT PRIMARY KEY,
      surveyId TEXT NOT NULL,
      item TEXT,
      sectionRef TEXT,
      description TEXT,
      professional TEXT,
      priority TEXT,
      estimatedCost REAL,
      FOREIGN KEY (surveyId) REFERENCES surveys(id)
    );
  `);

  return db;
}
