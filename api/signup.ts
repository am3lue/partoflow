import { db, ensureDb } from "./_lib/db";
import { uuidv4 } from "./_lib/utils";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { 
      first_name, last_name, id_number, 
      health_facility_name, password 
    } = body;
    
    if (!id_number || !password || !health_facility_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await ensureDb();

    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE id_number = ?",
      args: [id_number]
    });

    if (existing.rows.length > 0) {
      return new Response(JSON.stringify({ error: "Staff Identifier already in use" }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user_id = uuidv4();
    const facility_id = uuidv4();
    
    // Create Facility first
    await db.execute({
      sql: `INSERT INTO facilities (id, name, type) VALUES (?, ?, 'Dispensary')`,
      args: [facility_id, health_facility_name]
    });

    // Create User linked to facility
    await db.execute({
      sql: `INSERT INTO users (
        id, id_number, password, first_name, last_name, role, is_admin, facility_id
      ) VALUES (?, ?, ?, ?, ?, 'staff', 0, ?)`,
      args: [
        user_id, id_number, password, first_name || "", last_name || "", facility_id
      ]
    });

    return new Response(JSON.stringify({ 
      id: user_id, 
      health_facility_name: health_facility_name, 
      role: 'staff', 
      is_admin: false,
      facility_id: facility_id
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return new Response(JSON.stringify({ 
      error: "Registration failed",
      message: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
