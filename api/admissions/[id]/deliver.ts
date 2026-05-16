import { db, ensureDb } from "../../_lib/db";

export default async function handler(req: any, res: any) {
  try {
    await ensureDb();
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    
    await db.execute({
      sql: "UPDATE admissions SET status = 'delivered' WHERE event_id = ?",
      args: [id]
    });
    res.json({ message: "Admission marked as delivered" });
  } catch (err: any) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Service error", message: err.message });
  }
}
