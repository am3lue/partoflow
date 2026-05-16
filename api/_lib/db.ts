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

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const dbUrl = process.env.DATABASE_URL || (isVercel ? "" : "file:partoflow.db");

// Database client - Lazy initialized
let dbInstance: any = null;

export const db = {
  execute: async (args: any) => {
    if (!dbInstance) await ensureDb();
    return dbInstance.execute(args);
  },
  batch: async (args: any) => {
    if (!dbInstance) await ensureDb();
    return dbInstance.batch(args);
  }
};

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureDb() {
  if (isInitialized && dbInstance) return;
  if (initPromise) return initPromise;
  
  if (isVercel && (!dbUrl || dbUrl.trim() === "")) {
    console.error("CRITICAL: DATABASE_URL is missing in Vercel environment.");
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  initPromise = (async () => {
    try {
      console.log(`Creating DB client for: ${isVercel ? 'Vercel' : 'Local'}`);
      
      dbInstance = createClient({
        url: dbUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      });

      // Verify connection
      await dbInstance.execute("SELECT 1");
      
      // Background schema check
      initDb().catch(err => console.error("Background Schema Error:", err));
      
      isInitialized = true;
    } catch (err: any) {
      console.error("DB Connection Failure:", err.message);
      dbInstance = null;
      isInitialized = false;
      throw err;
    } finally {
      initPromise = null;
    }
  })();
  
  return initPromise;
}

export async function initDb() {
  try {
    console.log("Running schema initialization...");
    
    // Create tables in a single batch if possible, or sequentially
    // Using simple CREATE TABLE IF NOT EXISTS is safe and idempotent
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

    // Ensure default admin exists
    try {
      const adminCheck = await db.execute({
        sql: "SELECT id FROM users WHERE id_number = ?",
        args: ["ADMIN001"]
      });

      if (adminCheck.rows.length === 0) {
        console.log("Creating default admin user...");
        await db.execute({
          sql: `INSERT INTO users (id, role, is_admin, first_name, last_name, id_number, password, health_facility_name) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: ["admin-1", "admin", 1, "System", "Admin", "ADMIN001", "admin123", "Ministry of Health"]
        });
      }
    } catch (e) {
      console.warn("Could not verify/create default admin:", e);
    }

    // Optional: Check for missing columns and add them asynchronously
    checkAndAddMissingColumns().catch(err => console.warn("Migration check error (non-fatal):", err));

  } catch (err) {
    console.error("DATABASE INITIALIZATION ERROR:", err);
    throw err;
  }
}

async function checkAndAddMissingColumns() {
  try {
    const tableInfo = await db.execute("PRAGMA table_info(users)");
    if (!tableInfo || !tableInfo.rows) return;
    
    const columns = tableInfo.rows.map((r: any) => r.name);
    const requiredColumns = [
      { name: "middle_name", type: "TEXT" },
      { name: "facility_type", type: "TEXT" },
      { name: "physical_address", type: "TEXT" }
    ];

    for (const col of requiredColumns) {
      if (!columns.includes(col.name)) {
        try {
          await db.execute(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
          console.log(`Added missing column: ${col.name}`);
        } catch (e) {}
      }
    }
  } catch (e) {
    // PRAGMA might not be supported over HTTP in some cases
    console.debug("Migration check skipped (PRAGMA likely not supported)");
  }
}
