import { Admission, Observation } from '../types';
import { Plus, ChevronDown, Clock, Activity, Thermometer, Heart, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { format, differenceInHours } from 'date-fns';
import { useMemo } from 'react';

interface Props {
  admission: Admission;
  onAddSegment: () => void;
  onRecordDelivery: () => void;
}

export function PartographTimeline({ admission, onAddSegment, onRecordDelivery }: Props) {
  const observations = useMemo(() => {
    return [...(admission.observations || [])].sort((a, b) => 
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
  }, [admission.observations]);

  const isHighRisk = admission.risk_factors && admission.risk_factors.toLowerCase() !== 'none';

  // Find the start of the active phase (dilatation >= 4cm)
  const activePhaseStartIndex = useMemo(() => {
    return observations.findIndex(e => e.dilatation >= 4);
  }, [observations]);

  const activePhaseStartTime = activePhaseStartIndex !== -1 
    ? new Date(observations[activePhaseStartIndex].recorded_at) 
    : null;

  // Determine current status relative to Alert/Action lines
  const laborStatus = useMemo(() => {
    if (activePhaseStartIndex === -1 || observations.length === 0) return 'latent';
    
    const latestObs = observations[observations.length - 1];
    if (latestObs.dilatation >= 10) return 'complete';

    const hoursSinceStart = differenceInHours(new Date(latestObs.recorded_at), activePhaseStartTime!);
    
    const expectedDilatationAtTime = 4 + hoursSinceStart;
    const actionDilatationAtTime = 4 + (hoursSinceStart - 4);

    if (latestObs.dilatation < actionDilatationAtTime) return 'obstructed'; 
    if (latestObs.dilatation < expectedDilatationAtTime) return 'alert'; 
    return 'normal';
  }, [observations, activePhaseStartIndex, activePhaseStartTime]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      {/* Patient Summary Header */}
      <section className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-end bg-slate-50/50 dark:bg-slate-800/30 gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-light text-slate-800 dark:text-white tracking-tight">{admission.patient_name}</h1>
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-primary rounded-full text-[10px] font-black uppercase tracking-wider border border-primary/10">
              Bed 0{Math.floor(Math.random() * 9) + 1}
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-wider">
              {admission.status}
            </span>
            {laborStatus === 'obstructed' && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse shadow-lg shadow-red-500/20">
                <ShieldAlert className="w-3 h-3" />
                Action Required
              </span>
            )}
            {laborStatus === 'alert' && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-amber-500/20">
                <AlertTriangle className="w-3 h-3" />
                Alert: Slow Progress
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-8">
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Gravida/Para</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">G{admission.gravidity} / P{admission.parity}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Admission</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{admission.admission_time}</p>
            </div>
            <div className="hidden lg:block">
              <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Expected Delivery</p>
              <p className="text-sm font-semibold text-slate-500 italic">~ {format(new Date(new Date().getTime() + 8*60*60*1000), 'HH:mm')}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Age</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{admission.patient_age} Years</p>
            </div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-1">
              <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Risk Factors</p>
              <p className={`text-sm font-semibold ${isHighRisk ? 'text-secondary font-black' : 'text-slate-600'}`}>
                {admission.risk_factors || 'None Identified'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1 overflow-y-auto">
        {/* Graphical Partograph Section */}
        <section className="px-6 md:px-8 mt-6">
          <div className={`p-6 rounded-[32px] border ${isHighRisk ? 'border-red-100 bg-red-50/10' : 'border-slate-100 bg-white/50'} dark:bg-slate-800/40 dark:border-slate-800 transition-all`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Labor Progress Curve
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cervical Dilatation vs. Time (Active Phase Protocol)</p>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <LegendItem color="bg-primary" label="Progress" />
                  <LegendItem color="bg-amber-400" label="Alert Line" dashed />
                  <LegendItem color="bg-secondary" label="Action Line" dashed />
                </div>
            </div>

            <div className="relative h-64 md:h-96 w-full bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-4 overflow-hidden">
                <LaborChart observations={observations} activePhaseStartIndex={activePhaseStartIndex} />
            </div>
          </div>
        </section>

        {/* Observation Timeline Area */}
        <div className="flex-1 flex flex-col p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Clinical Registry
              <span className="text-slate-400 font-normal text-sm ml-2">| Detailed Logs</span>
            </h2>
          </div>

          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30 overflow-hidden">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 dark:bg-slate-800 transition-colors">
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest w-24">Time</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Temp/BP</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest text-center">Pulse</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest text-center">Fetal HR</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest text-center">Contractions</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest text-center">Dilatation</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest text-center">Descent</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Liquor/Mould</th>
                </tr>
              </thead>
              <tbody>
                {observations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-slate-300 dark:text-slate-600 italic font-medium">
                      No clinical segments recorded yet for this session.
                    </td>
                  </tr>
                ) : (
                  observations.map((obs, idx) => (
                    <motion.tr 
                      key={obs.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-4 font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {format(new Date(obs.recorded_at), 'HH:mm')}
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <span className="text-slate-400 font-normal">T:</span> {obs.temp}°C • <span className="text-slate-400 font-normal">BP:</span> {obs.bp_systolic}/{obs.bp_diastolic}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                        {obs.pulse} <span className="text-[10px] text-slate-300 dark:text-slate-600 font-normal">bpm</span>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                        {obs.fetal_heart_rate} <span className="text-[10px] text-slate-300 dark:text-slate-600 font-normal">bpm</span>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                        <p>{obs.contractions_per_10min} /10m</p>
                        <p className={`text-[9px] font-black text-slate-400 dark:text-slate-500`}>
                          {obs.contraction_duration}s
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 px-2.5 py-1 rounded-lg text-xs font-black ring-1 ring-amber-100 dark:ring-amber-900/30 italic">
                          {obs.dilatation} cm
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                        {obs.descent}/5
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400`}>
                            {obs.amniotic_fluid}
                          </span>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                            {obs.moulding}
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

function LegendItem({ color, label, dashed }: { color: string, label: string, dashed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-1 ${color} rounded-full ${dashed ? 'border-t-2 border-dashed bg-transparent border-current' : ''}`} />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );
}

function LaborChart({ observations, activePhaseStartIndex }: { observations: Observation[], activePhaseStartIndex: number }) {
  if (observations.length === 0) return null;

  const width = 1000;
  const height = 400;
  const paddingX = 80;
  const paddingY = 60;

  const firstObsTime = new Date(observations[0].recorded_at);
  const lastObsTime = new Date(observations[observations.length - 1].recorded_at);
  
  // Show at least 12 hours or more if labor is longer
  const laborDuration = differenceInHours(lastObsTime, firstObsTime);
  const maxHours = Math.max(12, laborDuration + 4);
  
  const xScale = (hours: number) => paddingX + (hours / maxHours) * (width - 2 * paddingX);
  const yScale = (dilatation: number) => (height - paddingY) - (dilatation / 10) * (height - 2 * paddingY);

  // Active Phase Lines (WHO standard)
  const alertLinePoints = useMemo(() => {
    if (activePhaseStartIndex === -1) return null;
    const startTimeStamp = new Date(observations[activePhaseStartIndex].recorded_at);
    const startHour = differenceInHours(startTimeStamp, firstObsTime);
    
    return {
      x1: xScale(startHour),
      y1: yScale(4),
      x2: xScale(startHour + 6), // 10cm - 4cm = 6 hours at 1cm/hr
      y2: yScale(10)
    };
  }, [activePhaseStartIndex, observations, firstObsTime, maxHours]);

  const actionLinePoints = useMemo(() => {
    if (!alertLinePoints) return null;
    const startTimeStamp = new Date(observations[activePhaseStartIndex].recorded_at);
    const startHour = differenceInHours(startTimeStamp, firstObsTime) + 4; // 4 hours offset

    return {
      x1: xScale(startHour),
      y1: yScale(4),
      x2: xScale(startHour + 6),
      y2: yScale(10)
    };
  }, [alertLinePoints, observations, activePhaseStartIndex, firstObsTime, maxHours]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-slate-400 select-none">
      {/* Grid Lines - Horizontal */}
      {[0, 2, 4, 6, 8, 10].map(d => (
        <g key={`y-${d}`}>
          <line 
            x1={paddingX} y1={yScale(d)} x2={width - paddingX} y2={yScale(d)} 
            className="stroke-slate-200 dark:stroke-slate-700/50" strokeWidth="1"
            strokeDasharray={d === 4 || d === 10 ? "" : "4 8"}
          />
          <text x={paddingX - 15} y={yScale(d)} textAnchor="end" dominantBaseline="middle" className="text-[14px] font-black fill-slate-400">{d}cm</text>
        </g>
      ))}

      {/* Grid Lines - Vertical */}
      {Array.from({ length: maxHours + 1 }).map((_, h) => (
        <g key={`x-${h}`}>
           <line 
             x1={xScale(h)} y1={paddingY} x2={xScale(h)} y2={height - paddingY} 
             className="stroke-slate-200 dark:stroke-slate-700/50" strokeWidth="1" 
             strokeDasharray="4 8"
           />
           {h % 2 === 0 && (
             <text x={xScale(h)} y={height - paddingY + 30} textAnchor="middle" className="text-[14px] font-black fill-slate-400">{h}h</text>
           )}
        </g>
      ))}

      {/* Active Phase Zone Highlighting */}
      {alertLinePoints && actionLinePoints && (
        <path 
          d={`M ${alertLinePoints.x1} ${alertLinePoints.y1} L ${alertLinePoints.x2} ${alertLinePoints.y2} L ${actionLinePoints.x2} ${actionLinePoints.y2} L ${actionLinePoints.x1} ${actionLinePoints.y1} Z`}
          className="fill-amber-400/10"
        />
      )}

      {/* Alert Line */}
      {alertLinePoints && (
        <line 
          x1={alertLinePoints.x1} y1={alertLinePoints.y1} x2={alertLinePoints.x2} y2={alertLinePoints.y2}
          className="stroke-amber-400" strokeWidth="3" strokeDasharray="10 5"
        />
      )}

      {/* Action Line */}
      {actionLinePoints && (
        <line 
          x1={actionLinePoints.x1} y1={actionLinePoints.y1} x2={actionLinePoints.x2} y2={actionLinePoints.y2}
          className="stroke-secondary" strokeWidth="3" strokeDasharray="10 5"
        />
      )}

      {/* Progress Path */}
      <motion.path 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        d={`M ${observations.map(e => `${xScale(differenceInHours(new Date(e.recorded_at), firstObsTime))} ${yScale(e.dilatation)}`).join(' L ')}`}
        fill="none"
        stroke="url(#grad-labor)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data Points */}
      {observations.map((obs, i) => {
        const x = xScale(differenceInHours(new Date(obs.recorded_at), firstObsTime));
        const y = yScale(obs.dilatation);
        return (
          <g key={obs.id} className="group">
            <circle cx={x} cy={y} r="8" className="fill-primary stroke-white dark:stroke-slate-900 cursor-pointer transition-transform group-hover:scale-125" strokeWidth="3" />
            {i === observations.length - 1 && (
              <circle cx={x} cy={y} r="12" className="fill-primary/20 animate-ping" />
            )}
            <foreignObject x={x - 40} y={y - 45} width="80" height="30" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-slate-900 text-white text-[10px] font-black p-1 text-center rounded shadow-xl">
                {obs.dilatation}cm
              </div>
            </foreignObject>
          </g>
        );
      })}

      <defs>
        <linearGradient id="grad-labor" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#005B5C" />
          <stop offset="100%" stopColor="#4D8F90" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TrendingUp(props: any) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
