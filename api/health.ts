import { db, ensureDb } from "./_lib/db";

export default async function handler(req: any, res: any) {
  try {
    await ensureDb();
    await db.execute("SELECT 1");
    
    // Diagnostic info (safe to expose)
    const dbUrl = process.env.DATABASE_URL || "";
    const urlInfo = dbUrl.startsWith("https://") ? "HTTPS (Good)" : 
                    dbUrl.startsWith("libsql://") ? "LIBSQL (Good)" : "LOCAL/INVALID";

    res.json({ 
      status: "ok", 
      database: "connected",
      protocol: urlInfo,
      vercel: !!process.env.VERCEL,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Health Check Failure:", err);
    res.status(500).json({ 
      status: "error", 
      message: err.message,
      hint: "Check if DATABASE_URL and DATABASE_AUTH_TOKEN are set in Vercel Settings",
      timestamp: new Date().toISOString()
    });
  }
}
