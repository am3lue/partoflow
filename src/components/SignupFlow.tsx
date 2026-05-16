import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Users, Lock, ChevronRight, ChevronLeft, Navigation, X } from 'lucide-react';
import { Logo } from './Logo';
import { UnifiedMap } from './UnifiedMap';
import { detectPreciseLocation } from '../lib/location';

export interface SignupData {
  first_name: string;
  middle_name: string;
  last_name: string;
  age: string;
  id_number: string;
  health_facility_name: string;
  facility_type: string;
  location: { lat: number; lng: number } | null;
  physical_address: string;
  team_members: { name: string; role: string }[];
  password: string;
}

export interface SignupFlowProps {
  onComplete: (data: SignupData) => void;
  onBack: () => void;
  isDark?: boolean;
  isLoading?: boolean;
}

export function SignupFlow({ onComplete, onBack, isDark, isLoading }: SignupFlowProps) {
  const [step, setStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState<SignupData>({
    first_name: '',
    middle_name: '',
    last_name: '',
    age: '',
    id_number: '',
    health_facility_name: '',
    facility_type: 'Dispensary',
    location: { lat: -6.7924, lng: 39.2083 }, // Default to Dar es Salaam
    physical_address: '',
    team_members: [],
    password: ''
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <Input label="First Name" value={formData.first_name} onChange={v => setFormData({...formData, first_name: v})} isDark={isDark} />
              <Input label="Middle Name" value={formData.middle_name} onChange={v => setFormData({...formData, middle_name: v})} isDark={isDark} />
              <Input label="Last Name" value={formData.last_name} onChange={v => setFormData({...formData, last_name: v})} isDark={isDark} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Age" type="number" value={formData.age} onChange={v => setFormData({...formData, age: v})} isDark={isDark} />
              <Input label="Staff ID / Govt ID" value={formData.id_number} onChange={v => setFormData({...formData, id_number: v})} isDark={isDark} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Facility Name" value={formData.health_facility_name} onChange={v => setFormData({...formData, health_facility_name: v})} isDark={isDark} />
              <div>
                <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 ml-1">Type</label>
                <select 
                  className="w-full p-3 border rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all bg-white border-primary/10 text-primary"
                  value={formData.facility_type}
                  onChange={e => setFormData({...formData, facility_type: e.target.value})}
                >
                  <option>Clinic</option>
                  <option>Dispensary</option>
                  <option>Health Center</option>
                  <option>Hospital</option>
                </select>
              </div>
            </div>
            <Input label="Physical Address" placeholder="Enter street or location details..." value={formData.physical_address} onChange={v => setFormData({...formData, physical_address: v})} isDark={isDark} />
            <div className="h-40 rounded-2xl overflow-hidden border border-primary/10 relative z-0">
               <UnifiedMap 
                  center={formData.location || { lat: -6.7924, lng: 39.2083 }}
                  markers={formData.location ? [formData.location] : []}
                  onMapClick={(pos) => setFormData(prev => ({ ...prev, location: pos }))}
                  isDark={isDark}
                />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
             <p className="text-[10px] font-black text-primary uppercase tracking-widest px-1">Medical Staff Team (Optional)</p>
             <div className="max-h-48 overflow-y-auto space-y-3 custom-scrollbar">
                {formData.team_members.map((member, i) => (
                  <div key={i} className="flex gap-2 p-3 bg-white border border-primary/10 rounded-xl relative">
                    <input className="flex-1 bg-transparent text-xs font-bold text-primary outline-none placeholder:text-primary/30" value={member.name} onChange={e => {
                      const updated = [...formData.team_members];
                      updated[i].name = e.target.value;
                      setFormData({...formData, team_members: updated});
                    }} placeholder="Member Name" />
                    <select className="bg-transparent text-xs font-bold text-primary outline-none" value={member.role} onChange={e => {
                      const updated = [...formData.team_members];
                      updated[i].role = e.target.value;
                      setFormData({...formData, team_members: updated});
                    }}>
                      <option>Nurse</option>
                      <option>Midwife</option>
                    </select>
                  </div>
                ))}
                <button onClick={() => setFormData({...formData, team_members: [...formData.team_members, { name: '', role: 'Nurse' }]})} className="w-full py-3 border-2 border-dashed border-primary/10 rounded-xl text-[10px] font-black uppercase text-primary hover:bg-primary/5 transition-all">
                  + Add Member
                </button>
             </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-primary mb-6">Final Security Protocol</h3>
            <Input label="Access Password" type="password" value={formData.password} onChange={v => setFormData({...formData, password: v})} isDark={isDark} />
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 relative overflow-hidden border border-primary/10 transition-colors duration-300">
      <div className="flex flex-col items-center justify-center mb-10">
        <Logo size="lg" className="mb-4" />
        <h2 className="text-xl font-black uppercase tracking-tighter text-primary">Institutional Onboarding</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Step 0{step} of 04</p>
      </div>

      <div className="flex gap-1.5 mb-8 justify-center">
        {[1,2,3,4].map(s => (
          <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-primary' : 'w-1.5 bg-primary/10'}`} />
        ))}
      </div>

      <div className="min-h-[260px]">
        {renderStep()}
      </div>

      <div className="mt-10 flex gap-3">
        {step > 1 ? (
          <button onClick={prevStep} className="h-14 px-6 rounded-2xl bg-white text-primary font-bold active:scale-95 transition-all border border-primary/20">
            Back
          </button>
        ) : (
          <button onClick={onBack} className="h-14 px-6 rounded-2xl bg-white text-primary font-bold active:scale-95 transition-all border border-primary/20">
            Cancel
          </button>
        )}

        <button 
          disabled={isLoading}
          onClick={step === 4 ? () => onComplete(formData) : nextStep}
          className="flex-1 h-14 bg-white text-primary border border-primary/20 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
        >
          {step === 4 ? (isLoading ? "Validating..." : "Complete Setup") : "Next Step"}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder, isDark }: { label: string, type?: string, value: string, onChange: (v: string) => void, placeholder?: string, isDark?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-primary uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full p-4 rounded-2xl text-sm font-bold border transition-all outline-none bg-white border-primary/10 text-primary placeholder:text-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/5"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
