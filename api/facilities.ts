import { db } from "./_lib/db";

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await db.execute("SELECT id, health_facility_name, facility_type, location_lat, location_lng FROM users WHERE role = 'dispensary'");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching facilities:", err);
    res.status(500).json({ error: "Failed to fetch facilities" });
  }
}
