import { db, ensureDb } from "../../_lib/db";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    await ensureDb();
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const id = new URL(req.url).pathname.split('/').slice(-2, -1)[0];
    
    await db.execute({
      sql: "UPDATE admissions SET status = 'delivered' WHERE id = ?",
      args: [id]
    });
    return new Response(JSON.stringify({ message: "Admission marked as delivered" }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error("Handler error:", err);
    return new Response(JSON.stringify({ error: "Service error", message: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
