import { db, ensureDb } from "../_lib/db";

export default async function handler(req: any, res: any) {
  try {
    await ensureDb();
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      first_name, last_name, id_number, password, 
      role, is_admin, health_facility_name 
    } = req.body;

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
  } catch (err: any) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Service error", message: err.message });
  }
}
