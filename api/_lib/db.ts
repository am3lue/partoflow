import { createClient } from "@libsql/client/web";

export const config = {
  runtime: 'edge',
};

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const dbUrl = process.env.DATABASE_URL || "file:partoflow.db";

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
  
  initPromise = (async () => {
    try {
      console.log(`[DB] Attempting connection. Target: ${dbUrl.startsWith('file:') ? 'Local File' : 'Remote Turso'}`);
      
      dbInstance = createClient({
        url: dbUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      });

      // Test connection
      await dbInstance.execute("SELECT 1");
      
      // Initialize schema
      await performInit(dbInstance);
      
      isInitialized = true;
      console.log("[DB] System Ready.");
    } catch (err: any) {
      console.error("[DB] Critical Failure:", err.message);
      dbInstance = null;
      isInitialized = false;
      throw err;
    } finally {
      initPromise = null;
    }
  })();
  
  return initPromise;
}

async function performInit(client: any) {
  try {
    console.log("[DB] Initializing Facilities...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS facilities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT,
        location_lat REAL,
        location_lng REAL,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("[DB] Initializing Users...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        id_number TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT DEFAULT 'staff',
        is_admin INTEGER DEFAULT 0,
        facility_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (facility_id) REFERENCES facilities(id)
      )
    `);

    console.log("[DB] Initializing Admissions...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS admissions (
        id TEXT PRIMARY KEY,
        facility_id TEXT NOT NULL,
        admitting_staff_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        patient_age INTEGER,
        patient_address TEXT,
        gravidity INTEGER,
        parity INTEGER,
        living INTEGER,
        height INTEGER,
        risk_factors TEXT,
        admission_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        outcome TEXT,
        FOREIGN KEY (facility_id) REFERENCES facilities(id),
        FOREIGN KEY (admitting_staff_id) REFERENCES users(id)
      )
    `);

    console.log("[DB] Initializing Observations...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS observations (
        id TEXT PRIMARY KEY,
        admission_id TEXT NOT NULL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        temp REAL,
        bp_systolic INTEGER,
        bp_diastolic INTEGER,
        pulse INTEGER,
        fetal_heart_rate INTEGER,
        amniotic_fluid TEXT,
        moulding TEXT,
        dilatation INTEGER,
        descent INTEGER,
        contractions_per_10min INTEGER,
        contraction_duration INTEGER,
        oxytocin_units REAL,
        oxytocin_drops_per_min INTEGER,
        drugs_given TEXT,
        urine_protein TEXT,
        urine_acetone TEXT,
        urine_volume INTEGER,
        FOREIGN KEY (admission_id) REFERENCES admissions(id)
      )
    `);

    console.log("[DB] Seeding Data...");
    const defaultFacilityId = "system-facility";
    await client.execute({
      sql: "INSERT OR IGNORE INTO facilities (id, name, type) VALUES (?, ?, ?)",
      args: [defaultFacilityId, "Ministry of Health", "Administrative"]
    });

    const adminCheck = await client.execute({
      sql: "SELECT id FROM users WHERE id_number = ?",
      args: ["ADMIN001"]
    });

    if (adminCheck.rows.length === 0) {
      await client.execute({
        sql: `INSERT INTO users (id, id_number, password, first_name, last_name, role, is_admin, facility_id) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ["admin-1", "ADMIN001", "admin123", "System", "Admin", "admin", 1, defaultFacilityId]
      });
    }
  } catch (err: any) {
    console.error("[DB] Schema Error:", err.message);
  }
}

export const initDb = () => performInit(dbInstance);
