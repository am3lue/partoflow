export interface User {
  id: string;
  id_number: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff';
  is_admin: boolean;
  facility_id: string;
  health_facility_name: string;
}

export interface Admission {
  id: string;
  facility_id: string;
  admitting_staff_id: string;
  patient_name: string;
  patient_age: number;
  patient_address: string;
  gravidity: number;
  parity: number;
  living: number;
  height: number;
  risk_factors: string;
  admission_time: string;
  status: 'active' | 'delivered' | 'referred' | 'discharged';
  outcome?: string;
  observations?: Observation[];
}

export interface Observation {
  id: string;
  admission_id: string;
  recorded_at: string;
  
  // Maternal Vitals
  temp: number;
  bp_systolic: number;
  bp_diastolic: number;
  pulse: number;
  
  // Fetal Status
  fetal_heart_rate: number;
  amniotic_fluid: 'I' | 'C' | 'M' | 'B';
  moulding: '0' | '+' | '++' | '+++';
  
  // Labor Progress
  dilatation: number;
  descent: number;
  contractions_per_10min: number;
  contraction_duration: number;
  
  // Interventions
  oxytocin_units?: number;
  oxytocin_drops_per_min?: number;
  drugs_given?: string;
  urine_protein?: string;
  urine_acetone?: string;
  urine_volume?: number;
}
