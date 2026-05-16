import { db, ensureDb } from "../_lib/db";
import { decrypt } from "../_lib/utils";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    await ensureDb();
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const facility_id = new URL(req.url).searchParams.get('facility_id');
    const userResult = await db.execute({
      sql: "SELECT role, is_admin FROM users WHERE id = ?",
      args: [facility_id || '']
    });
    
    const user = userResult.rows[0] as any;
    const isAdmin = user && (user.role === 'admin' || user.is_admin === 1);

    let query = "SELECT * FROM admissions WHERE status = 'active'";
    let args: any[] = [];

    if (!isAdmin && facility_id) {
      query += " AND facility_id = ?";
      args.push(facility_id);
    } else if (!isAdmin && !facility_id) {
      return new Response(JSON.stringify({ error: "Unauthorized access" }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const result = await db.execute({ sql: query, args });
    const rows = await Promise.all(result.rows.map(async (row: any) => ({
      ...row,
      patient_name: await decrypt(row.patient_name),
      patient_address: await decrypt(row.patient_address)
    })));
    return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error("Handler error:", err);
    return new Response(JSON.stringify({ error: "Service error", message: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
