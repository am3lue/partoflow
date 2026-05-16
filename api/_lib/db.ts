import { createClient } from "@libsql/client/web";

export const config = {
  runtime: 'edge',
};

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;

// Smart URL detection
// Locally: uses partoflow.db file
// Vercel: uses DATABASE_URL from environment variables
const dbUrl = isVercel 
  ? process.env.DATABASE_URL 
  : (process.env.DATABASE_URL || "file:partoflow.db");

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
    // We don't throw immediately to allow for a clearer error in the handler
  }

  initPromise = (async () => {
    try {
      console.log(`Connecting to DB: ${isVercel ? 'Remote (Vercel)' : 'Local/Dev'}`);
      
      dbInstance = createClient({
        url: dbUrl || "",
        authToken: process.env.DATABASE_AUTH_TOKEN,
      });

      // Simple connectivity test
      await dbInstance.execute("SELECT 1");
      
      // Initialize schema if needed
      await initDb();
      
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
    console.log("Initializing Clean Database Schema...");

    // To perform a clean reset, you can uncomment these lines once and deploy, 
    // then comment them back. For now, we use CREATE TABLE IF NOT EXISTS.
    /*
    await db.execute("DROP TABLE IF EXISTS observations");
    await db.execute("DROP TABLE IF EXISTS admissions");
    await db.execute("DROP TABLE IF EXISTS users");
    await db.execute("DROP TABLE IF EXISTS facilities");
    */

    // 1. Facilities (The Hospitals/Dispensaries)
    await db.execute(`
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

    // 2. Users (Staff / Midwives)
    await db.execute(`
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

    // 3. Admissions (Patient records)
    await db.execute(`
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
        status TEXT DEFAULT 'active', -- active, delivered, referred, discharged
        outcome TEXT,
        FOREIGN KEY (facility_id) REFERENCES facilities(id),
        FOREIGN KEY (admitting_staff_id) REFERENCES users(id)
      )
    `);

    // 4. Observations (Partograph/Clinical data)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS observations (
        id TEXT PRIMARY KEY,
        admission_id TEXT NOT NULL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Maternal Vitals
        temp REAL,
        bp_systolic INTEGER,
        bp_diastolic INTEGER,
        pulse INTEGER,
        
        -- Fetal Status
        fetal_heart_rate INTEGER,
        amniotic_fluid TEXT, -- I (Intact), C (Clear), M (Meconium), B (Blood)
        moulding TEXT, -- 0, +, ++, +++
        
        -- Labor Progress
        dilatation INTEGER, -- 0-10 cm
        descent INTEGER, -- 0-5
        contractions_per_10min INTEGER,
        contraction_duration INTEGER, -- seconds
        
        -- Interventions
        oxytocin_units REAL,
        oxytocin_drops_per_min INTEGER,
        drugs_given TEXT,
        urine_protein TEXT,
        urine_acetone TEXT,
        urine_volume INTEGER,
        
        FOREIGN KEY (admission_id) REFERENCES admissions(id)
      )
    `);

    // Ensure Default Admin Facility
    const defaultFacilityId = "system-facility";
    await db.execute({
      sql: "INSERT OR IGNORE INTO facilities (id, name, type) VALUES (?, ?, ?)",
      args: [defaultFacilityId, "Ministry of Health", "Administrative"]
    });

    // Ensure default admin exists
    const adminCheck = await db.execute({
      sql: "SELECT id FROM users WHERE id_number = ?",
      args: ["ADMIN001"]
    });

    if (adminCheck.rows.length === 0) {
      console.log("Creating default admin user...");
      await db.execute({
        sql: `INSERT INTO users (id, id_number, password, first_name, last_name, role, is_admin, facility_id) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ["admin-1", "ADMIN001", "admin123", "System", "Admin", "admin", 1, defaultFacilityId]
      });
    }

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
