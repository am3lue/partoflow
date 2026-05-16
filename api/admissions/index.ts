import { db, ensureDb } from "../_lib/db";
import { uuidv4, encrypt } from "../_lib/utils";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    await ensureDb();
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const { 
      patient_name, patient_age, patient_address, gravidity, parity, living, height, 
      risk_factors, admission_time, facility_id, admitting_staff_id 
    } = await req.json();
    
    const id = uuidv4();
    await db.execute({
      sql: `INSERT INTO admissions (
        id, facility_id, admitting_staff_id, patient_name, patient_age, patient_address, gravidity, parity, living, 
        height, risk_factors, admission_time, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      args: [
        id, facility_id, admitting_staff_id, await encrypt(patient_name), patient_age, await encrypt(patient_address), Number(gravidity), Number(parity), Number(living),
        Number(height), risk_factors, admission_time || new Date().toISOString()
      ]
    });
    return new Response(JSON.stringify({ id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error("Handler error:", err);
    return new Response(JSON.stringify({ error: "Service error", message: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
