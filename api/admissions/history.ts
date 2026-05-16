import { db, ensureDb } from "../_lib/db";
import { decrypt } from "../_lib/utils";

export default async function handler(req: any, res: any) {
  try {
    await ensureDb();
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const facility_id = req.query.facility_id as string;
    const userResult = await db.execute({
      sql: "SELECT role, is_admin FROM users WHERE id = ?",
      args: [facility_id || '']
    });
    
    const user = userResult.rows[0] as any;
    const isAdmin = user && (user.role === 'admin' || user.is_admin === 1);

    let query = "SELECT * FROM admissions WHERE status != 'active'";
    let args: any[] = [];

    if (!isAdmin && facility_id) {
      query += " AND facility_id = ?";
      args.push(facility_id);
    } else if (!isAdmin && !facility_id) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    query += " ORDER BY date_of_admission DESC";

    const result = await db.execute({ sql: query, args });
    const rows = result.rows.map((row: any) => ({
      ...row,
      client_name: decrypt(row.client_name),
      address: decrypt(row.address)
    }));
    res.json(rows);
  } catch (err: any) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Service error", message: err.message });
  }
}
