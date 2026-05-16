import { db, ensureDb } from "../_lib/db";
import { decrypt } from "../_lib/utils";

export default async function handler(req: any, res: any) {
  await ensureDb();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query; // Vercel provides dynamic segments in query
  
  try {
    const admission = await db.execute({
      sql: "SELECT * FROM admissions WHERE event_id = ?",
      args: [id]
    });
    
    if (admission.rows.length === 0) {
      return res.status(404).json({ error: "Admission not found" });
    }

    const row = admission.rows[0] as any;
    const decryptedRow = {
      ...row,
      client_name: decrypt(row.client_name as string),
      address: decrypt(row.address as string)
    };

    const exams = await db.execute({
      sql: "SELECT * FROM examinations WHERE event_id = ? ORDER BY examination_time ASC",
      args: [id]
    });
    res.json({ ...decryptedRow, examinations: exams.rows });
  } catch (err) {
    console.error("Error fetching admission details:", err);
    res.status(500).json({ error: "Failed to fetch admission details" });
  }
}
