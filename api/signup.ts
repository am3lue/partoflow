import { db, ensureDb } from "./_lib/db";
import { uuidv4 } from "./_lib/utils";

export default async function handler(req: any, res: any) {
  try {
    await ensureDb();
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      first_name, middle_name, last_name, age, id_number, 
      health_facility_name, facility_type, location, physical_address, team_members, password 
    } = req.body;
    
    if (!id_number || !password || !health_facility_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE id_number = ?",
      args: [id_number]
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Staff Identifier already in use" });
    }

    const user_id = uuidv4();
    
    await db.execute({
      sql: `INSERT INTO users (
        id, role, first_name, middle_name, last_name, age, id_number, 
        health_facility_name, facility_type, location_lat, location_lng, physical_address, password
      ) VALUES (?, 'dispensary', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        user_id, first_name, middle_name, last_name, Number(age) || 0, id_number,
        health_facility_name, facility_type, 
        location?.lat || 0, location?.lng || 0, physical_address, password
      ]
    });

    if (team_members && Array.isArray(team_members)) {
      for (const member of team_members) {
        if (member.name) {
          await db.execute({
            sql: "INSERT INTO team_members (id, facility_id, name, role) VALUES (?, ?, ?, ?)",
            args: [uuidv4(), user_id, member.name, member.role || '']
          });
        }
      }
    }

    res.status(201).json({ 
      id: user_id, 
      health_facility_name: health_facility_name, 
      role: 'dispensary', 
      is_admin: false 
    });
  } catch (err: any) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Service error", message: err.message });
  }
}
