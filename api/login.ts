import { db, ensureDb } from "./_lib/db";

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
    const { id_number, password } = body || {};
    
    await ensureDb();
    
    if (!id_number || !password) {
      return new Response(JSON.stringify({ error: "ID number and password are required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await db.execute({
      sql: `SELECT u.*, f.name as health_facility_name 
            FROM users u 
            LEFT JOIN facilities f ON u.facility_id = f.id 
            WHERE u.id_number = ? AND u.password = ?`,
      args: [id_number, password]
    });
    
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const user = result.rows[0] as any;
    return new Response(JSON.stringify({ 
      id: user.id, 
      health_facility_name: user.health_facility_name || 'Ministry of Health', 
      role: user.role,
      is_admin: Boolean(user.is_admin),
      facility_id: user.facility_id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error("Login failure:", err);
    return new Response(JSON.stringify({ 
      error: "Authentication service error", 
      message: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
