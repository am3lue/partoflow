import { db } from "../../_lib/db";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  try {
    await db.execute({
      sql: "UPDATE admissions SET status = 'delivered' WHERE event_id = ?",
      args: [id]
    });
    res.json({ message: "Admission marked as delivered" });
  } catch (err) {
    console.error("Error recording delivery:", err);
    res.status(500).json({ error: "Failed to record delivery" });
  }
}
