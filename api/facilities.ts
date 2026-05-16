import { db, ensureDb } from "./_lib/db";

export default async function handler(req: any, res: any) {
  try {
    await ensureDb();
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const result = await db.execute("SELECT id, health_facility_name, facility_type, location_lat, location_lng FROM users WHERE role = 'dispensary'");
    res.json(result.rows);
  } catch (err: any) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Service error", message: err.message });
  }
}
