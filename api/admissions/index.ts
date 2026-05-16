import { db, ensureDb } from "../_lib/db";
import { uuidv4, encrypt } from "../_lib/utils";

export default async function handler(req: any, res: any) {
  try {
    await ensureDb();
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      client_name, age, address, gravidity, parity, living, height, 
      risk_factors, date_of_admission, time_of_admission, facility_id 
    } = req.body;
    
    const event_id = uuidv4();
    await db.execute({
      sql: `INSERT INTO admissions (
        event_id, facility_id, client_name, age, address, gravidity, parity, living, 
        height, risk_factors, date_of_admission, time_of_admission, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      args: [
        event_id, facility_id, encrypt(client_name), age, encrypt(address), Number(gravidity), Number(parity), Number(living),
        Number(height), risk_factors, date_of_admission, time_of_admission
      ]
    });
    res.status(201).json({ event_id });
  } catch (err: any) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Service error", message: err.message });
  }
}
