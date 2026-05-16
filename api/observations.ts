import { db, ensureDb } from "./_lib/db";
import { uuidv4 } from "./_lib/utils";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    await ensureDb();
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const { 
      admission_id, recorded_at, temp, bp_systolic, bp_diastolic, pulse,
      fetal_heart_rate, amniotic_fluid, moulding, dilatation, descent,
      contractions_per_10min, contraction_duration, oxytocin_units,
      oxytocin_drops_per_min, drugs_given, urine_protein, urine_acetone, urine_volume
    } = await req.json();

    const id = uuidv4();
    await db.execute({
      sql: `INSERT INTO observations (
        id, admission_id, recorded_at, temp, bp_systolic, bp_diastolic, pulse,
        fetal_heart_rate, amniotic_fluid, moulding, dilatation, descent,
        contractions_per_10min, contraction_duration, oxytocin_units,
        oxytocin_drops_per_min, drugs_given, urine_protein, urine_acetone, urine_volume
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, admission_id, recorded_at || new Date().toISOString(), 
        temp, bp_systolic, bp_diastolic, pulse,
        fetal_heart_rate, amniotic_fluid, moulding, dilatation, descent,
        contractions_per_10min, contraction_duration, oxytocin_units,
        oxytocin_drops_per_min, drugs_given, urine_protein, urine_acetone, urine_volume
      ]
    });
    return new Response(JSON.stringify({ id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error("Handler error:", err);
    return new Response(JSON.stringify({ error: "Service error", message: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
