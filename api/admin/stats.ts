import { db, ensureDb } from "../_lib/db";
import { decrypt } from "../_lib/utils";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    await ensureDb();
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const user_id = new URL(req.url).searchParams.get('user_id');
    const userResult = await db.execute({
      sql: "SELECT role, is_admin FROM users WHERE id = ?",
      args: [user_id || '']
    });
    const user = userResult.rows[0] as any;
    if (!user || (user.role !== 'admin' && user.is_admin !== 1)) {
      return new Response(JSON.stringify({ error: "Unauthorized access" }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const facilities = await db.execute("SELECT COUNT(*) as count FROM facilities");
    const activeAdmissions = await db.execute("SELECT COUNT(*) as count FROM admissions WHERE status = 'active'");
    const totalDelivered = await db.execute("SELECT COUNT(*) as count FROM admissions WHERE status = 'delivered'");
    
    const recent = await db.execute(`
      SELECT a.patient_name, a.status, f.name as facility_name, a.admission_time
      FROM admissions a
      JOIN facilities f ON a.facility_id = f.id
      ORDER BY a.admission_time DESC
      LIMIT 10
    `);

    const activity = await Promise.all(recent.rows.map(async (r: any) => ({
      ...r,
      patient_name: await decrypt(r.patient_name)
    })));

    return new Response(JSON.stringify({
      total_facilities: facilities.rows[0].count,
      active_cases: activeAdmissions.rows[0].count,
      deliveries: totalDelivered.rows[0].count,
      recent_activity: activity
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error("Handler error:", err);
    return new Response(JSON.stringify({ error: "Service error", message: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
