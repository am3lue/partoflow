import { motion } from 'framer-motion';
import { BookOpen, Activity, Search, ShieldCheck, FileText, Share2, ClipboardCheck, X } from 'lucide-react';

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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col border dark:border-slate-700 transition-colors duration-300"
      >
        <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl text-white shadow-teal">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Clinical Guide v1.0</h2>
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">Operating Procedures</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors group"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-100" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="space-y-3 group text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{item.title}</h4>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed pl-13">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 bg-secondary/5 rounded-3xl border border-secondary/10 flex items-start gap-4">
            <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Capacitor Deployment</h5>
              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                Platform is built on a responsive mobile-first architecture. Native app bridging via Capacitor is supported for offline field synchronization (Phase 4).
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-center">
          <button 
            onClick={onClose}
            className="px-10 h-12 bg-slate-800 dark:bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 dark:hover:opacity-90 transition-all shadow-xl"
          >
            Acknowledge Protocols
          </button>
        </div>
      </motion.div>
    </div>
  );
}
