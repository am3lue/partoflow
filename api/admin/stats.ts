import { db, ensureDb } from "../_lib/db";
import { decrypt } from "../_lib/utils";

export default async function handler(req: any, res: any) {
  try {
    await ensureDb();
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const user_id = req.query.user_id as string;
    const userResult = await db.execute({
      sql: "SELECT role, is_admin FROM users WHERE id = ?",
      args: [user_id || '']
    });
    const user = userResult.rows[0] as any;
    if (!user || (user.role !== 'admin' && user.is_admin !== 1)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const facilities = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'dispensary'");
    const activeAdmissions = await db.execute("SELECT COUNT(*) as count FROM admissions WHERE status = 'active'");
    const totalDelivered = await db.execute("SELECT COUNT(*) as count FROM admissions WHERE status = 'delivered'");
    
    const recent = await db.execute(`
      SELECT a.client_name, a.status, u.health_facility_name, a.date_of_admission
      FROM admissions a
      JOIN users u ON a.facility_id = u.id
      ORDER BY a.date_of_admission DESC, a.time_of_admission DESC
      LIMIT 10
    `);

    const activity = recent.rows.map((r: any) => ({
      ...r,
      client_name: decrypt(r.client_name)
    }));

    res.json({
      total_facilities: facilities.rows[0].count,
      active_cases: activeAdmissions.rows[0].count,
      deliveries: totalDelivered.rows[0].count,
      recent_activity: activity
    });
  } catch (err: any) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Service error", message: err.message });
  }
}
