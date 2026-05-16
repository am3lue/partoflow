import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Info, Settings, Database, Activity, Server, Clock, User, Building2, Key } from 'lucide-react';
import { Logo } from './Logo';
import { User as UserType } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export function SystemInfoModal({ isOpen, onClose, isDark }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border rounded-[32px] overflow-hidden shadow-2xl`}
          >
            <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-blue-500 text-white">
              <div className="flex items-center gap-3">
                <Logo variant="white" size="md" />
                <div>
                  <h3 className="font-black uppercase tracking-widest text-xs">System Intelligence</h3>
                  <p className="text-[10px] opacity-70">Internal Registry & Protocol Version</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={<Database className="w-4 h-4" />} label="Database" value="Edge-Lite v4.2" isDark={isDark} />
                <InfoItem icon={<Activity className="w-4 h-4" />} label="Security" value="AES-256 GCM" isDark={isDark} />
                <InfoItem icon={<Server className="w-4 h-4" />} label="Environment" value="Production" isDark={isDark} />
                <InfoItem icon={<Clock className="w-4 h-4" />} label="Uptime" value="99.98%" isDark={isDark} />
              </div>

              <div className={`p-6 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} border border-slate-100 dark:border-slate-600`}>
                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4">Core Protocol Version</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">App Version</span>
                  <span className="text-xs font-mono bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">2.0.4-stable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Protocol Type</span>
                  <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">HL7 Compliant</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 italic">Authorized Use Only</p>
                <p className="text-[9px] text-slate-400 opacity-60"> Ministry of Health © 2026. Data is strictly regulated under the Healthcare Privacy Act.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function AccountSettingsModal({ isOpen, onClose, isDark, user }: ModalProps & { user: UserType | null }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border rounded-[32px] overflow-hidden shadow-2xl`}
          >
            <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <Logo variant="primary" size="md" />
                <div>
                  <h3 className="font-black uppercase tracking-widest text-xs">Profile Configuration</h3>
                  <p className="text-[10px] opacity-70">Account Security & Access Tokens</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-white text-2xl font-black shadow-lg">
                     {user?.health_facility_name.charAt(0)}
                   </div>
                   <div>
                     <h4 className="font-black text-lg">{user?.health_facility_name}</h4>
                     <p className="text-xs text-slate-400 font-mono italic">Account ID: {user?.id.slice(0, 12)}...</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <SettingsField icon={<Building2 className="w-4 h-4" />} label="Institution" value={user?.health_facility_name || '-'} isDark={isDark} />
                  <SettingsField icon={<User className="w-4 h-4" />} label="Clearance Level" value={user?.role?.toUpperCase() || '-'} isDark={isDark} />
                  <SettingsField icon={<Shield className="w-4 h-4" />} label="Security Status" value={user?.is_admin ? "Full Access Control" : "Standard Operator"} isDark={isDark} active />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-700/50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                  <Key className="w-4 h-4" />
                  Request Primary Key Reset
                </button>
                <p className="text-[10px] text-center text-slate-400 italic">To modify institution records, please contact national administration.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SecurityVerificationModal({ isOpen, onClose, onVerified, isDark, actionLabel }: ModalProps & { onVerified: () => void, actionLabel: string }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleVerify = () => {
    // In a real app, we would verify the password/PIN against the server
    // For this prototype, any non-empty input works, or a specific "admin" check
    if (pin.length > 0) {
      onVerified();
      onClose();
      setPin('');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative w-full max-w-sm ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-100'} border-2 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]`}
          >
            <div className="p-8 text-center space-y-6">
              <Logo size="lg" className="mx-auto" />
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Identity Check Required</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                  You are performing a <span className="text-primary font-black uppercase">{actionLabel}</span> protocol. Please verify your clearance.
                </p>
              </div>

              <div className="space-y-4">
                <input 
                  autoFocus
                  type="password"
                  placeholder="Enter Security Passkey"
                  className={`w-full p-4 rounded-xl text-center text-lg font-bold border-2 transition-all outline-none ${
                    error 
                      ? 'border-secondary bg-secondary/10 animate-shake' 
                      : isDark ? 'bg-slate-700 border-slate-600 focus:border-primary' : 'bg-slate-50 border-slate-100 focus:border-primary'
                  }`}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={onClose}
                    className="p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={handleVerify}
                    className="p-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal/20 transition-all hover:scale-[1.02]"
                  >
                    Authorize
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InfoItem({ icon, label, value, isDark }: { icon: any, label: string, value: string, isDark: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
      <div className="text-primary mb-1">{icon}</div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-xs font-bold truncate">{value}</p>
    </div>
  );
}

function SettingsField({ icon, label, value, isDark, active = false }: { icon: any, label: string, value: string, isDark: boolean, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${active ? 'border-primary/30 bg-primary/5' : isDark ? 'border-slate-700 bg-slate-700/20' : 'border-slate-50 bg-slate-50/50'}`}>
      <div className={`p-2 rounded-lg ${active ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-xs font-bold dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}
