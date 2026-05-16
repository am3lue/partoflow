import { db, ensureDb } from "../_lib/db";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    await ensureDb();
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const { 
      first_name, last_name, id_number, password, 
      role, is_admin, facility_id 
    } = await req.json();

    const id = `user-${Date.now()}`;
    await db.execute({
      sql: `INSERT INTO users (
        id, first_name, last_name, id_number, password, 
        role, is_admin, facility_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, first_name, last_name, id_number, password, 
        role || 'staff', is_admin ? 1 : 0, facility_id || 'system-facility'
      ]
    });
    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error("Handler error:", err);
    return new Response(JSON.stringify({ error: "Service error", message: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
