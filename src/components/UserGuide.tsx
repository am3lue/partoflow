import { motion } from 'framer-motion';
import { Activity, Search, ShieldCheck, FileText, Share2, ClipboardCheck, X } from 'lucide-react';
import { Logo } from './Logo';

interface Props {
  onClose: () => void;
}

export function UserGuide({ onClose }: Props) {
  const steps = [
    {
      icon: <Activity className="w-5 h-5" />,
      title: "Real-time Monitoring",
      desc: "Record hourly clinical observations directly into the timeline. The digital partograph updates instantly."
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Integrity Checks",
      desc: "Automated validation for dilation and descent progress helps identify labor deviations early."
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Historical Records",
      desc: "Access fully encrypted past records in the 'History' view. No data is stored as plain text."
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "AES Encryption",
      desc: "All clinical data and patient identifiers use AES-256 industrial-grade encryption protocols."
    },
    {
      icon: <ClipboardCheck className="w-5 h-5" />,
      title: "Admission Protocol",
      desc: "Standardized intake forms ensure all risk factors are captured upon patient arrival."
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-white/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-50 transition-colors duration-300"
      >
        <div className="p-8 border-b border-primary/10 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <Logo size="md" variant="primary" />
            <div>
              <h2 className="text-xl font-black text-primary tracking-tight">Clinical Guide v1.0</h2>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Operating Procedures</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors group"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="space-y-3 group text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-primary/20 flex items-center justify-center text-primary transition-all duration-300">
                    <div className="text-primary">{item.icon}</div>
                  </div>
                  <h4 className="font-bold text-primary text-sm">{item.title}</h4>
                </div>
                <p className="text-xs text-primary leading-relaxed pl-13">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-primary/10 flex items-start gap-4">
            <div className="p-2 bg-white text-primary border border-primary/20 rounded-lg">
              <Share2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h5 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Capacitor Deployment</h5>
              <p className="text-[10px] text-primary italic leading-relaxed">
                Platform is built on a responsive mobile-first architecture. Native app bridging via Capacitor is supported for offline field synchronization (Phase 4).
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-50 flex justify-center">
          <button 
            onClick={onClose}
            className="px-10 h-12 bg-white text-primary border border-primary rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-xl"
          >
            Acknowledge Protocols
          </button>
        </div>
      </motion.div>
    </div>
  );
}
