import { Admission } from '../types';
import { User, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  key?: string | number;
  admission: Admission;
  onClick: (id: string) => void;
}

export function PatientCard({ admission, onClick }: Props) {
  const isHighRisk = admission.risk_factors && admission.risk_factors.toLowerCase() !== 'none';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      className="bg-white rounded-xl border border-slate-100 transition-all cursor-pointer p-4 flex items-center justify-between gap-4 hover:border-primary/30"
      onClick={() => onClick(admission.event_id)}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
          <User className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-800">{admission.client_name}</h3>
            {isHighRisk && (
              <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded text-[9px] font-black uppercase tracking-wider">
                Risk
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span className="font-medium whitespace-nowrap">Age {admission.age}</span>
            <span>•</span>
            <span className="font-medium whitespace-nowrap uppercase">G{admission.gravidity} P{admission.parity}</span>
            <span>•</span>
            <span className="font-medium">Adm: {admission.time_of_admission}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Status</p>
          <p className="text-xs font-bold text-primary capitalize">{admission.status}</p>
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
