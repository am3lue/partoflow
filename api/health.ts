import { db, ensureDb } from "./_lib/db";

export default async function handler(req: any, res: any) {
  res.json({ 
    status: "diagnosing", 
    hasUrl: !!process.env.DATABASE_URL,
    hasToken: !!process.env.DATABASE_AUTH_TOKEN,
    vercel: !!process.env.VERCEL,
    timestamp: new Date().toISOString()
  });
}
