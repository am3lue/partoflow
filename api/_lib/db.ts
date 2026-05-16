import { createClient } from "@libsql/client";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Encryption utilities
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "fallback_secret_for_dev_mode_only";
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';
const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();

export function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text;
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Database client
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
export const db = createClient({
  url: process.env.DATABASE_URL || (isVercel ? "file:/tmp/partoflow.db" : "file:partoflow.db"),
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureDb() {
  if (isInitialized) return;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      const dbUrl = process.env.DATABASE_URL || "";
      console.log(`Initializing DB connection to: ${dbUrl.substring(0, 10)}... (Vercel: ${isVercel})`);
      
      // If we are on Vercel and have a remote URL, we might want to skip the check-write test
      // as it's primarily for local file debugging
      if (isVercel && dbUrl && !dbUrl.startsWith("file:")) {
         // Just a quick check to see if we can reach the DB
         await db.execute("SELECT 1");
      }

      await initDb();
      isInitialized = true;
      console.log("DB Initialization complete.");
    } catch (err) {
      console.error("Delayed DB Init Error details:", err);
      // We don't re-throw here to allow the function to try to proceed 
    } finally {
      initPromise = null;
    }
  })();
  
  return initPromise;
}

export async function initDb() {
  try {
    // Check if we can write to the database
    const dbUrl = process.env.DATABASE_URL || "";
    if (!dbUrl || dbUrl.startsWith('file:')) {
      console.log("Using local file database.");
      try {
        await db.execute("CREATE TABLE IF NOT EXISTS _write_test (id INTEGER PRIMARY KEY)");
        await db.execute("DROP TABLE _write_test");
      } catch (e) {
        console.error("DATABASE PERSISTENCE WARNING: Local filesystem is not writable.");
      }
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        role TEXT CHECK(role IN ('admin', 'dispensary')),
        is_admin INTEGER DEFAULT 0,
        health_facility_name TEXT,
        facility_type TEXT,
        first_name TEXT,
        middle_name TEXT,
        last_name TEXT,
        age INTEGER,
        id_number TEXT,
        location_lat REAL,
        location_lng REAL,
        physical_address TEXT,
        password TEXT
      )
    `);

    // Migration logic
    const tableInfo = await db.execute("PRAGMA table_info(users)");
    const columns = tableInfo.rows.map((r: any) => r.name);
    const requiredColumns = [
      "first_name", "middle_name", "last_name", "age", 
      "id_number", "location_lat", "location_lng", "physical_address", "password",
      "facility_type", "health_facility_name", "role", "is_admin"
    ];

    for (const col of requiredColumns) {
      if (!columns.includes(col)) {
        const type = (col === 'age' || col === 'is_admin') ? 'INTEGER' : (col.includes('location')) ? 'REAL' : 'TEXT';
        try {
          await db.execute(`ALTER TABLE users ADD COLUMN ${col} ${type}`);
        } catch (e) {}
      }
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        facility_id TEXT,
        name TEXT,
        role TEXT,
        FOREIGN KEY(facility_id) REFERENCES users(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS admissions (
        event_id TEXT PRIMARY KEY,
        facility_id TEXT,
        client_name TEXT,
        age INTEGER,
        address TEXT,
        gravidity INTEGER,
        parity INTEGER,
        living INTEGER,
        height INTEGER,
        risk_factors TEXT,
        date_of_admission TEXT,
        time_of_admission TEXT,
        status TEXT CHECK(status IN ('active', 'delivered', 'referred')),
        FOREIGN KEY(facility_id) REFERENCES users(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS examinations (
        id TEXT PRIMARY KEY,
        event_id TEXT,
        examination_time TEXT,
        temp REAL,
        bp TEXT,
        pulse INTEGER,
        contractions INTEGER,
        contraction_strength TEXT,
        presentation TEXT,
        lie TEXT,
        cx_position TEXT,
        cx_texture TEXT,
        cx_dilatation INTEGER,
        descent INTEGER,
        membrane_status TEXT,
        amniotic_fluid_color TEXT,
        FOREIGN KEY(event_id) REFERENCES admissions(event_id)
      )
    `);

    // Ensure default admin
    const adminCheck = await db.execute({
      sql: "SELECT id FROM users WHERE id_number = ?",
      args: ["ADMIN001"]
    });

    if (adminCheck.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO users (id, role, is_admin, first_name, last_name, id_number, password, health_facility_name) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ["admin-1", "admin", 1, "System", "Admin", "ADMIN001", "admin123", "Ministry of Health"]
      });
    }

  } catch (err) {
    console.error("DATABASE INITIALIZATION ERROR:", err);
    throw err;
  }
}
