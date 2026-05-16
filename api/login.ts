import { db, ensureDb } from "./_lib/db";

export default async function handler(req: any, res: any) {
  const { id_number, password } = req.body;
  
  try {
    await ensureDb();
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE id_number = ? AND password = ?",
      args: [id_number, password]
    });
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = result.rows[0] as any;
    res.json({ 
      id: user.id, 
      health_facility_name: user.health_facility_name, 
      role: user.role,
      is_admin: Boolean(user.is_admin)
    });
  } catch (err: any) {
    console.error("Login failure:", err);
    res.status(500).json({ 
      error: "Authentication service error", 
      message: err.message,
      details: err.code || "No error code"
    });
  }
}
