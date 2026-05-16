import { Admission } from '../types';
import { Plus, ChevronDown, Clock, Activity, Thermometer, Heart, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

interface Props {
  admission: Admission;
  onAddSegment: () => void;
  onRecordDelivery: () => void;
}

export function PartographTimeline({ admission, onAddSegment, onRecordDelivery }: Props) {
  const exams = admission.examinations || [];
  const isHighRisk = admission.risk_factors && admission.risk_factors.toLowerCase() !== 'none';

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      {/* Patient Summary Header */}
      <section className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-end bg-slate-50/50 dark:bg-slate-800/30 gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-light text-slate-800 dark:text-white tracking-tight">{admission.client_name}</h1>
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-primary rounded-full text-[10px] font-black uppercase tracking-wider border border-primary/10">
              Bed 0{Math.floor(Math.random() * 9) + 1}
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-wider">
              {admission.status}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-8">
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Gravida/Para</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">G{admission.gravidity} / P{admission.parity}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Admission</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{admission.date_of_admission} • {admission.time_of_admission}</p>
            </div>
            <div className="hidden lg:block">
              <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Expected Delivery</p>
              <p className="text-sm font-semibold text-slate-500 italic">~ {format(new Date(new Date().getTime() + 8*60*60*1000), 'HH:mm')}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Age</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{admission.age} Years</p>
            </div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-1">
              <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Risk Factors</p>
              <p className={`text-sm font-semibold ${isHighRisk ? 'text-secondary' : 'text-slate-600'}`}>
                {admission.risk_factors || 'None Identified'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Examination Timeline Area */}
      <div className="flex-1 overflow-hidden flex flex-col p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Examination Timeline
            <span className="text-slate-400 font-normal text-sm ml-2">| Hourly Segments</span>
          </h2>
          <div className="hidden md:flex gap-4">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary"></div><span className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Vitals</span></div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"></div><span className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Fetal</span></div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div><span className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Labor</span></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10 transition-colors">
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest w-24">Time</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Temp/BP</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest text-center">Pulse</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest text-center">Presentation</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest text-center">Contractions</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest text-center">Dilatation</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest text-center">Descent</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Liquor</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-slate-300 dark:text-slate-600 italic font-medium">
                    No clinical segments recorded yet for this session.
                  </td>
                </tr>
              ) : (
                exams.map((exam, idx) => (
                  <motion.tr 
                    key={exam.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-4 font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {format(new Date(exam.examination_time), 'HH:mm')}
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
                       <span className="text-slate-400 font-normal">T:</span> {exam.temp}°C • <span className="text-slate-400 font-normal">BP:</span> {exam.bp}
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                      {exam.pulse} <span className="text-[10px] text-slate-300 dark:text-slate-600 font-normal">bpm</span>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                      <p>{exam.presentation}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-normal italic">{exam.lie}</p>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                      <p>{exam.contractions} /10m</p>
                      <p className={`text-[9px] font-black ${exam.contraction_strength === 'Strong' ? 'text-secondary' : 'text-slate-400 dark:text-slate-500'}`}>
                        {exam.contraction_strength}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 px-2.5 py-1 rounded-lg text-xs font-black ring-1 ring-amber-100 dark:ring-amber-900/30 italic">
                        {exam.cx_dilatation} cm
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                      {exam.descent}/5
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${exam.membrane_status === 'Intact' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-secondary/10 text-secondary'}`}>
                          {exam.membrane_status}
                        </span>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                          {exam.amniotic_fluid_color}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Actions */}
      {admission.status === 'active' && (
        <footer className="h-24 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-8 flex items-center justify-between shrink-0 transition-colors">
          <button 
            onClick={() => {}} // Referral logic could go here
            className="h-14 px-8 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
          >
            Referral Protocol
          </button>
          <div className="flex gap-4">
            <button 
              onClick={onRecordDelivery}
              className="h-14 px-8 bg-secondary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-coral hover:opacity-90 transition-all"
            >
              Record Delivery
            </button>
            <button 
              onClick={onAddSegment}
              className="h-14 px-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-teal flex items-center gap-2 hover:opacity-90 transition-all"
            >
              <span className="text-xl mb-0.5">+</span> Add Hourly Segment
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
