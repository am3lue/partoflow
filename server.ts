import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@libsql/client";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "fallback_secret_for_dev_mode_only";
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

// Derive a 32-byte key from the secret
const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();

function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text;
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const app = express();
app.use(express.json());
const PORT = 3000;

// Database Configuration
const db = createClient({
  url: process.env.DATABASE_URL || "file:partoflow.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function initDb() {
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

  // Migration: Ensure all columns exist for existing tables
  const tableInfo = await db.execute("PRAGMA table_info(users)");
  const columns = tableInfo.rows.map((r: any) => r.name);
  
  const requiredColumns = [
    "first_name", "middle_name", "last_name", "age", 
    "id_number", "location_lat", "location_lng", "physical_address", "password",
    "facility_type", "health_facility_name", "role", "is_admin"
  ];

  for (const col of requiredColumns) {
    if (!columns.includes(col)) {
      console.log(`Adding missing column ${col} to users table...`);
      const type = (col === 'age' || col === 'is_admin') ? 'INTEGER' : (col.includes('location')) ? 'REAL' : 'TEXT';
      try {
        await db.execute(`ALTER TABLE users ADD COLUMN ${col} ${type}`);
      } catch (e) {
        console.warn(`Could not add column ${col}:`, e);
      }
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

  // Ensure default admin exists
  const adminCheck = await db.execute({
    sql: "SELECT id FROM users WHERE id_number = ?",
    args: ["ADMIN001"]
  });

  if (adminCheck.rows.length === 0) {
    console.log("Creating default admin user...");
    await db.execute({
      sql: `INSERT INTO users (
        id, role, is_admin, first_name, last_name, id_number, password, health_facility_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ["admin-1", "admin", 1, "System", "Admin", "ADMIN001", "admin123", "Ministry of Health"]
    });
  }

  // Bootstrap facilities and data if empty
  const usersCount = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'dispensary'");
  if (usersCount.rows[0].count === 0) {
    console.log("Bootstrapping initial facilities...");
    const facilities = [
      { id: "f1", name: "Ipululu Dispensary" },
      { id: "f2", name: "Imalakaseko Dispensary" },
      { id: "f3", name: "City Central Clinic" }
    ];

    for (const f of facilities) {
      await db.execute({
        sql: "INSERT INTO users (id, role, health_facility_name) VALUES (?, ?, ?)",
        args: [f.id, "dispensary", f.name]
      });
    }

    // Seed CSV data
    const csvData = [
      { id: "e3df99ce", facility: "f1", name: "Rr", age: 30, address: "Germany", gravidity: 6, parity: 5, living: 4, height: 162, risk: "None", date: "10/21/2025", time: "17:24:36" },
      { id: "f43c8784", facility: "f1", name: "MA", age: 28, address: "DC Igalula, Ipululu, Tanzania", gravidity: 2, parity: 1, living: 1, height: 152, risk: "Previous scar", date: "10/27/2025", time: "9:10:00" },
      { id: "9fbed762", facility: "f1", name: "ERM", age: 25, address: "Vumilia", gravidity: 3, parity: 2, living: 2, height: 169, risk: "None", date: "10/27/2025", time: "10:26:04" }
    ];

    for (const p of csvData) {
      await db.execute({
        sql: `INSERT INTO admissions (
          event_id, facility_id, client_name, age, address, gravidity, parity, living, 
          height, risk_factors, date_of_admission, time_of_admission, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        args: [p.id, p.facility, p.name, p.age, p.address, p.gravidity, p.parity, p.living, p.height, p.risk, p.date, p.time]
      });
    }

    console.log("Database initialized with seed data.");
  }
}

// API Routes with enhanced logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/api/admissions/active", async (req, res) => {
  const { facility_id, role, is_admin } = req.query;
  try {
    let query = "SELECT * FROM admissions WHERE status = 'active'";
    let args: any[] = [];

    if (role !== 'admin' && is_admin !== '1' && facility_id) {
      query += " AND facility_id = ?";
      args.push(facility_id);
    }

    const result = await db.execute({ sql: query, args });
    const rows = result.rows.map((row: any) => ({
      ...row,
      client_name: decrypt(row.client_name),
      address: decrypt(row.address)
    }));
    res.json(rows);
  } catch (err) {
    console.error("Error fetching active admissions:", err);
    res.status(500).json({ error: "Failed to fetch active admissions", details: String(err) });
  }
});

app.get("/api/admissions/history", async (req, res) => {
  const { facility_id, role, is_admin } = req.query;
  try {
    let query = "SELECT * FROM admissions WHERE status != 'active'";
    let args: any[] = [];

    if (role !== 'admin' && is_admin !== '1' && facility_id) {
      query += " AND facility_id = ?";
      args.push(facility_id);
    }

    query += " ORDER BY date_of_admission DESC";

    const result = await db.execute({ sql: query, args });
    const rows = result.rows.map((row: any) => ({
      ...row,
      client_name: decrypt(row.client_name),
      address: decrypt(row.address)
    }));
    res.json(rows);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch history", details: String(err) });
  }
});

app.post("/api/admin/users", async (req, res) => {
  const { 
    first_name, last_name, id_number, password, 
    role, is_admin, health_facility_name 
  } = req.body;

  try {
    const id = `user-${Date.now()}`;
    await db.execute({
      sql: `INSERT INTO users (
        id, first_name, last_name, id_number, password, 
        role, is_admin, health_facility_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, first_name, last_name, id_number, password, 
        role || 'dispensary', is_admin ? 1 : 0, health_facility_name || 'Ministry'
      ]
    });
    res.json({ success: true, id });
  } catch (err) {
    console.error("Manual user creation error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.get("/api/admin/stats", async (req, res) => {
  try {
    const facilities = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'dispensary'");
    const activeAdmissions = await db.execute("SELECT COUNT(*) as count FROM admissions WHERE status = 'active'");
    const totalDelivered = await db.execute("SELECT COUNT(*) as count FROM admissions WHERE status = 'delivered'");
    
    // Get recent activity
    const recent = await db.execute(`
      SELECT a.client_name, a.status, u.health_facility_name, a.date_of_admission
      FROM admissions a
      JOIN users u ON a.facility_id = u.id
      ORDER BY a.date_of_admission DESC, a.time_of_admission DESC
      LIMIT 10
    `);

    const activity = recent.rows.map((r: any) => ({
      ...r,
      client_name: decrypt(r.client_name)
    }));

    res.json({
      total_facilities: facilities.rows[0].count,
      active_cases: activeAdmissions.rows[0].count,
      deliveries: totalDelivered.rows[0].count,
      recent_activity: activity
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.post("/api/admissions", async (req, res) => {
  const { 
    client_name, age, address, gravidity, parity, living, height, 
    risk_factors, date_of_admission, time_of_admission, facility_id 
  } = req.body;
  
  const event_id = uuidv4();
  try {
    await db.execute({
      sql: `INSERT INTO admissions (
        event_id, facility_id, client_name, age, address, gravidity, parity, living, 
        height, risk_factors, date_of_admission, time_of_admission, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      args: [
        event_id, facility_id, encrypt(client_name), age, encrypt(address), Number(gravidity), Number(parity), Number(living),
        Number(height), risk_factors, date_of_admission, time_of_admission
      ]
    });
    res.status(201).json({ event_id });
  } catch (err) {
    console.error("Error creating admission:", err);
    res.status(500).json({ error: "Failed to create admission", details: String(err) });
  }
});

app.get("/api/admissions/:id", async (req, res) => {
  try {
    const event_id = req.params.id;
    const admission = await db.execute({
      sql: "SELECT * FROM admissions WHERE event_id = ?",
      args: [event_id]
    });
    
    if (admission.rows.length === 0) {
      return res.status(404).json({ error: "Admission not found" });
    }

    const row = admission.rows[0] as any;
    const decryptedRow = {
      ...row,
      client_name: decrypt(row.client_name as string),
      address: decrypt(row.address as string)
    };

    const exams = await db.execute({
      sql: "SELECT * FROM examinations WHERE event_id = ? ORDER BY examination_time ASC",
      args: [event_id]
    });
    res.json({ ...decryptedRow, examinations: exams.rows });
  } catch (err) {
    console.error("Error fetching admission details:", err);
    res.status(500).json({ error: "Failed to fetch admission details", details: String(err) });
  }
});

app.post("/api/examinations", async (req, res) => {
  const { 
    event_id, examination_time, temp, bp, pulse, contractions, contraction_strength, 
    presentation, lie, cx_position, cx_texture, cx_dilatation, descent, 
    membrane_status, amniotic_fluid_color 
  } = req.body;
  const id = uuidv4();
  try {
    await db.execute({
      sql: `INSERT INTO examinations (
        id, event_id, examination_time, temp, bp, pulse, contractions, 
        contraction_strength, presentation, lie, cx_position, 
        cx_texture, cx_dilatation, descent, membrane_status, amniotic_fluid_color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, event_id, examination_time, Number(temp), bp, Number(pulse), 
        Number(contractions), contraction_strength, presentation, lie, 
        cx_position, cx_texture, Number(cx_dilatation), Number(descent), 
        membrane_status, amniotic_fluid_color
      ]
    });
    res.status(201).json({ id });
  } catch (err) {
    console.error("Error adding examination segment:", err);
    res.status(500).json({ error: "Failed to add examination segment", details: String(err) });
  }
});

app.post("/api/admissions/:id/deliver", async (req, res) => {
  try {
    await db.execute({
      sql: "UPDATE admissions SET status = 'delivered' WHERE event_id = ?",
      args: [req.params.id]
    });
    res.json({ message: "Admission marked as delivered" });
  } catch (err) {
    console.error("Error recording delivery:", err);
    res.status(500).json({ error: "Failed to record delivery", details: String(err) });
  }
});

app.get("/api/facilities", async (req, res) => {
  try {
    const result = await db.execute("SELECT id, health_facility_name, facility_type, location_lat, location_lng FROM users WHERE role = 'dispensary'");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching facilities:", err);
    res.status(500).json({ error: "Failed to fetch facilities", details: String(err) });
  }
});

app.post("/api/signup", async (req, res) => {
  const { 
    first_name, middle_name, last_name, age, id_number, 
    health_facility_name, facility_type, location, physical_address, team_members, password 
  } = req.body;
  
  const user_id = uuidv4();
  try {
    // Encrypt sensitive name info? User asked to encrypt records. 
    // I'll encrypt names for consistency with their request for medical records.
    await db.execute({
      sql: `INSERT INTO users (
        id, role, first_name, middle_name, last_name, age, id_number, 
        health_facility_name, facility_type, location_lat, location_lng, physical_address, password
      ) VALUES (?, 'dispensary', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        user_id, first_name, middle_name, last_name, Number(age), id_number,
        health_facility_name, facility_type, 
        location?.lat || 0, location?.lng || 0, physical_address, password
      ]
    });

    if (team_members && Array.isArray(team_members)) {
      for (const member of team_members) {
        await db.execute({
          sql: "INSERT INTO team_members (id, facility_id, name, role) VALUES (?, ?, ?, ?)",
          args: [uuidv4(), user_id, member.name, member.role]
        });
      }
    }

    res.status(201).json({ 
      id: user_id, 
      name: health_facility_name, 
      role: 'dispensary', 
      is_admin: false 
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to create account", details: String(err) });
  }
});

app.post("/api/login", async (req, res) => {
  const { id_number, password } = req.body;
  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE id_number = ? AND password = ?",
      args: [id_number, password]
    });
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = result.rows[0] as any;
    res.json({ 
      id: user.id, 
      health_facility_name: user.health_facility_name, 
      role: user.role,
      is_admin: Boolean(user.is_admin)
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Catch-all for API to prevent HTML responses
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
});


async function startServer() {
  await initDb();
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
