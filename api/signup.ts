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
    
    await db.execute({
      sql: `INSERT INTO users (
        id, role, first_name, last_name, id_number, 
        health_facility_name, password, is_admin
      ) VALUES (?, 'dispensary', ?, ?, ?, ?, ?, 0)`,
      args: [
        user_id, first_name || "", last_name || "", id_number,
        health_facility_name, password
      ]
    });

    return new Response(JSON.stringify({ 
      id: user_id, 
      health_facility_name: health_facility_name, 
      role: 'dispensary', 
      is_admin: false 
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
