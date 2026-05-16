import { db, ensureDb } from "../_lib/db";
import { decrypt } from "../_lib/utils";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    await ensureDb();
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const id = new URL(req.url).pathname.split('/').pop();
    
    const admission = await db.execute({
      sql: "SELECT * FROM admissions WHERE id = ?",
      args: [id]
    });
    
    if (admission.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Admission not found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const row = admission.rows[0] as any;
    const decryptedRow = {
      ...row,
      patient_name: await decrypt(row.patient_name as string),
      patient_address: await decrypt(row.patient_address as string)
    };

    const observations = await db.execute({
      sql: "SELECT * FROM observations WHERE admission_id = ? ORDER BY recorded_at ASC",
      args: [id]
    });
    return new Response(JSON.stringify({ ...decryptedRow, observations: observations.rows }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error("Handler error:", err);
    return new Response(JSON.stringify({ error: "Service error", message: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
