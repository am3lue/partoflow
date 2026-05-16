import { db, ensureDb } from "./_lib/db";

export default async function handler(req: any, res: any) {
  try {
    await ensureDb();
    await db.execute("SELECT 1");
    res.json({ 
      status: "ok", 
      database: "connected",
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL ? "vercel" : "local"
    });
  } catch (err: any) {
    res.status(500).json({ 
      status: "error", 
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
