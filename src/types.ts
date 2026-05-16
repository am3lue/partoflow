export interface User {
  id: string;
  role: 'admin' | 'dispensary';
  health_facility_name: string;
  is_admin?: boolean;
}

export interface Admission {
  event_id: string;
  facility_id: string;
  client_name: string;
  age: number;
  address: string;
  gravidity: number;
  parity: number;
  living: number;
  height: number;
  risk_factors: string;
  date_of_admission: string;
  time_of_admission: string;
  status: 'active' | 'delivered' | 'referred';
  examinations?: Examination[];
}

export interface Examination {
  id: string;
  event_id: string;
  examination_time: string;
  temp: number;
  bp: string;
  pulse: number;
  contractions: number;
  contraction_strength: 'Mild' | 'Moderate' | 'Strong';
  presentation: 'Cephalic' | 'Breech' | 'Shoulder' | 'Face';
  lie: 'Longitudinal' | 'Transverse' | 'Oblique';
  cx_position: 'Anterior' | 'Mid' | 'Posterior';
  cx_texture: 'Soft' | 'Firm' | 'Thin' | 'Thick';
  cx_dilatation: number;
  descent: number;
  membrane_status: 'Intact' | 'Ruptured';
  amniotic_fluid_color: 'N/A' | 'Clear' | 'Mec-stained' | 'Blood-stained';
}
