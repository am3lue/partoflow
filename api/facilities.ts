import { db, ensureDb } from "./_lib/db";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    await ensureDb();
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const result = await db.execute("SELECT id, name, type, location_lat, location_lng, address FROM facilities");
    return new Response(JSON.stringify(result.rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error("Handler error:", err);
    return new Response(JSON.stringify({ error: "Service error", message: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
