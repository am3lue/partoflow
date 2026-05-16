import { db } from "./_lib/db";
import { uuidv4 } from "./_lib/utils";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    event_id, examination_time, temp, bp, pulse, contractions, contraction_strength, 
    presentation, lie, cx_position, cx_texture, cx_dilatation, descent, 
    membrane_status, amniotic_fluid_color 
  } = req.body;
  const id = uuidv4();
  try {
    await db.execute({
      sql: `INSERT INTO examinations (
        id, event_id, examination_time, temp, bp, pulse, contractions, 
        contraction_strength, presentation, lie, cx_position, 
        cx_texture, cx_dilatation, descent, membrane_status, amniotic_fluid_color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, event_id, examination_time, Number(temp), bp, Number(pulse), 
        Number(contractions), contraction_strength, presentation, lie, 
        cx_position, cx_texture, Number(cx_dilatation), Number(descent), 
        membrane_status, amniotic_fluid_color
      ]
    });
    res.status(201).json({ id });
  } catch (err) {
    console.error("Error adding examination segment:", err);
    res.status(500).json({ error: "Failed to add examination segment" });
  }
}
