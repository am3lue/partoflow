import { motion, AnimatePresence } from 'motion/react';
import { X, Save, AlertTriangle } from 'lucide-react';
import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-primary/10 backdrop-blur-[2px]" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden border border-primary/10 transition-colors duration-300"
          >
            <div className="flex items-center justify-between p-6 border-b border-primary/10 bg-white">
              <h3 className="text-xl font-black text-primary tracking-tighter">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-primary/5 rounded-xl transition-colors group">
                <X className="w-5 h-5 text-primary/30 group-hover:text-primary" />
              </button>
            </div>
            <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function AdmissionFormModal({ 
  isOpen, onClose, onSave 
}: { 
  isOpen: boolean; onClose: () => void; onSave: (data: any) => void 
}) {
  const [formData, setFormData] = useState({
    patient_name: '', patient_age: '', patient_address: '', gravidity: '', parity: '', living: '', 
    height: '', risk_factors: '', admission_time: new Date().toISOString().slice(0, 16)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Labor Admission">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1.5 ml-1">Full Patient Name</label>
            <input 
              required
              className="w-full p-3.5 bg-white border border-primary/10 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-bold text-primary placeholder:text-primary/30"
              value={formData.patient_name}
              onChange={e => setFormData({...formData, patient_name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1.5 ml-1">Age (Years)</label>
              <input 
                type="number" required
                className="w-full p-3.5 bg-white border border-primary/10 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-bold text-primary"
                value={formData.patient_age}
                onChange={e => setFormData({...formData, patient_age: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1.5 ml-1">Height (cm)</label>
              <input 
                type="number" required
                className="w-full p-3.5 bg-white border border-primary/10 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-bold text-primary"
                value={formData.height}
                onChange={e => setFormData({...formData, height: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">Gravidity</label>
            <input 
              type="number" required
              className="w-full p-2 bg-white border border-primary/10 rounded-lg outline-none text-center font-bold text-primary"
              value={formData.gravidity}
              onChange={e => setFormData({...formData, gravidity: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">Parity</label>
            <input 
              type="number" required
              className="w-full p-2 bg-white border border-primary/10 rounded-lg outline-none text-center font-bold text-primary"
              value={formData.parity}
              onChange={e => setFormData({...formData, parity: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">Living</label>
            <input 
              type="number" required
              className="w-full p-2 bg-white border border-primary/10 rounded-lg outline-none text-center font-bold text-primary"
              value={formData.living}
              onChange={e => setFormData({...formData, living: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1.5 ml-1">Home Address / Contact</label>
          <textarea 
            className="w-full p-3.5 bg-white border border-primary/10 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-bold text-primary min-h-[70px]"
            value={formData.patient_address}
            onChange={e => setFormData({...formData, patient_address: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1.5 ml-1">Admission Date & Time</label>
            <input 
              type="datetime-local" required
              className="w-full p-3.5 bg-white border border-primary/10 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-bold text-primary"
              value={formData.admission_time}
              onChange={e => setFormData({...formData, admission_time: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1.5 ml-1">Risk Factors</label>
          <input 
            placeholder="e.g. Hypertension, Prev C/S"
            className="w-full p-3.5 bg-white border border-primary/10 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-black text-primary placeholder:text-primary/30"
            value={formData.risk_factors}
            onChange={e => setFormData({...formData, risk_factors: e.target.value})}
          />
        </div>

        <button type="submit" className="w-full py-4 bg-white text-primary border border-primary/20 rounded-xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-primary/5 transition-all mt-4">
          <Save className="w-4 h-4" />
          Initialize Digital Partograph
        </button>
      </form>
    </Modal>
  );
}

export function ObservationFormModal({ 
  isOpen, onClose, onSave 
}: { 
  isOpen: boolean; onClose: () => void; onSave: (data: any) => void 
}) {
  const [formData, setFormData] = useState({
    temp: '37.0', bp_systolic: '120', bp_diastolic: '80', pulse: '80', 
    fetal_heart_rate: '140', amniotic_fluid: 'I', moulding: '0',
    dilatation: '4', descent: '4', contractions_per_10min: '3', 
    contraction_duration: '30', urine_protein: '', urine_acetone: '', urine_volume: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, recorded_at: new Date().toISOString() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Hourly Observation">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vital Signs Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1 ml-1">Temperature (°C)</label>
              <input required className="w-full p-3 bg-white border border-primary/10 rounded-xl focus:border-primary outline-none text-sm font-bold text-primary" value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} />
            </div>
            <div>
              <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1 ml-1">B/P Systolic (mmHg)</label>
              <input required className="w-full p-3 bg-white border border-primary/10 rounded-xl focus:border-primary outline-none text-sm font-bold text-primary" value={formData.bp_systolic} onChange={e => setFormData({...formData, bp_systolic: e.target.value})} />
            </div>
          </div>
          <div className="space-y-4">
             <div>
              <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1 ml-1">Pulse Rate (bpm)</label>
              <input type="number" required className="w-full p-3 bg-white border border-primary/10 rounded-xl focus:border-primary outline-none text-sm font-bold text-primary" value={formData.pulse} onChange={e => setFormData({...formData, pulse: e.target.value})} />
            </div>
            <div>
              <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1 ml-1">B/P Diastolic (mmHg)</label>
              <input required className="w-full p-3 bg-white border border-primary/10 rounded-xl focus:border-primary outline-none text-sm font-bold text-primary" value={formData.bp_diastolic} onChange={e => setFormData({...formData, bp_diastolic: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Fetal Status Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1 ml-1">Fetal Heart Rate</label>
            <input type="number" required className="w-full p-3 bg-white border border-primary/10 rounded-xl focus:border-primary outline-none text-sm font-bold text-primary" value={formData.fetal_heart_rate} onChange={e => setFormData({...formData, fetal_heart_rate: e.target.value})} />
          </div>
          <div>
            <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1 ml-1">Dilatation (cm)</label>
            <input 
              type="number" 
              required 
              max={10} 
              min={0} 
              className="w-full p-3 bg-white border border-primary/10 rounded-xl focus:border-primary outline-none text-sm font-black text-primary" 
              value={formData.dilatation} 
              onChange={e => {
                const val = e.target.value;
                if (val === '' || (Number(val) >= 0 && Number(val) <= 10)) {
                  setFormData({...formData, dilatation: val});
                }
              }} 
            />
          </div>
        </div>

        {/* Contractions Section */}
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
          <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-2 ml-1">Contractions</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] font-bold text-primary/40 mb-1 ml-1">Frequency (/10m)</p>
              <input type="number" required className="w-full p-2.5 bg-white border border-primary/10 rounded-lg text-sm font-bold text-primary" value={formData.contractions_per_10min} onChange={e => setFormData({...formData, contractions_per_10min: e.target.value})} />
            </div>
            <div>
              <p className="text-[8px] font-bold text-primary/40 mb-1 ml-1">Duration (seconds)</p>
              <input type="number" required className="w-full p-2.5 bg-white border border-primary/10 rounded-lg text-sm font-bold text-primary" value={formData.contraction_duration} onChange={e => setFormData({...formData, contraction_duration: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Descent & Liquor/Moulding */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1 ml-1">Descent</label>
            <select className="w-full p-2.5 bg-white border border-primary/10 rounded-xl text-[10px] font-bold text-primary outline-none" value={formData.descent} onChange={e => setFormData({...formData, descent: e.target.value})}>
              {[5,4,3,2,1,0].map(n => <option key={n} value={n}>{n}/5</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1 ml-1">Liquor</label>
            <select className="w-full p-2.5 bg-white border border-primary/10 rounded-xl text-[10px] font-bold text-primary outline-none" value={formData.amniotic_fluid} onChange={e => setFormData({...formData, amniotic_fluid: e.target.value})}>
              <option value="I">I (Intact)</option>
              <option value="C">C (Clear)</option>
              <option value="M">M (Meconium)</option>
              <option value="B">B (Blood)</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1 ml-1">Moulding</label>
            <select className="w-full p-2.5 bg-white border border-primary/10 rounded-xl text-[10px] font-bold text-primary outline-none" value={formData.moulding} onChange={e => setFormData({...formData, moulding: e.target.value})}>
              <option value="0">0</option>
              <option value="+">+</option>
              <option value="++">++</option>
              <option value="+++">+++</option>
            </select>
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-white text-primary border border-primary/20 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-primary/5 transition-all mt-4">
          <Save className="w-4 h-4" />
          Append Hourly Observation
        </button>
      </form>
    </Modal>
  );
}

export function DeliveryOutcomeModal({ 
  isOpen, onClose, onConfirm 
}: { 
  isOpen: boolean; onClose: () => void; onConfirm: () => void 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hospital Discharge / Delivery">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 border border-primary/10">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-bold text-primary tracking-tight mb-2">Record Delivery Outcome?</h4>
        <p className="text-xs text-primary/40 font-medium leading-relaxed max-w-[240px] mx-auto">
          Finalizing this record will move the patient to the delivered registry. This action is definitive.
        </p>

        <div className="mt-10 space-y-3">
          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-white text-primary border border-primary/20 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-primary/5 transition-all shadow-sm"
          >
            Confirm Delivery & Close
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 text-primary/40 font-bold uppercase tracking-widest text-[10px] hover:text-primary transition-colors"
          >
            Return to Timeline
          </button>
        </div>
      </div>
    </Modal>
  );
}
