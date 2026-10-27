import * as SQLite from 'expo-sqlite';
import type { NewTrip, SavedTrip } from '../domain/types';
import type { ModeId } from '../domain/modes';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('tracker.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS trips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mode TEXT NOT NULL,
          kind TEXT NOT NULL,
          from_id TEXT NOT NULL, from_name TEXT NOT NULL, from_lat REAL, from_lon REAL,
          to_id TEXT NOT NULL, to_name TEXT NOT NULL, to_lat REAL, to_lon REAL,
          route TEXT,
          created_at INTEGER NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

interface Row {
  id: number; mode: string; kind: string;
  from_id: string; from_name: string; from_lat: number | null; from_lon: number | null;
  to_id: string; to_name: string; to_lat: number | null; to_lon: number | null;
  route: string | null; created_at: number;
}

const fromRow = (r: Row): SavedTrip => ({
  id: r.id,
  mode: r.mode as ModeId,
  kind: r.kind as SavedTrip['kind'],
  from: { id: r.from_id, name: r.from_name, lat: r.from_lat ?? undefined, lon: r.from_lon ?? undefined },
  to: { id: r.to_id, name: r.to_name, lat: r.to_lat ?? undefined, lon: r.to_lon ?? undefined },
  route: r.route,
  createdAt: r.created_at,
});

export async function listTrips(limit?: number): Promise<SavedTrip[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(`SELECT * FROM trips ORDER BY created_at DESC, id DESC ${limit ? `LIMIT ${Math.floor(limit)}` : ''}`);
  return rows.map(fromRow);
}

export async function countTrips(): Promise<number> {
  const db = await getDb();
  return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM trips'))?.n ?? 0;
}

export async function getTrip(id: number): Promise<SavedTrip | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<Row>('SELECT * FROM trips WHERE id = ?', id);
  return r ? fromRow(r) : null;
}

export async function addTrip(t: NewTrip): Promise<number> {
  const db = await getDb();
  const res = await db.runAsync(
    `INSERT INTO trips (mode, kind, from_id, from_name, from_lat, from_lon, to_id, to_name, to_lat, to_lon, route, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    t.mode, t.kind, t.from.id, t.from.name, t.from.lat ?? null, t.from.lon ?? null,
    t.to.id, t.to.name, t.to.lat ?? null, t.to.lon ?? null, t.route, Date.now(),
  );
  return res.lastInsertRowId;
}

export async function deleteTrip(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM trips WHERE id = ?', id);
}
