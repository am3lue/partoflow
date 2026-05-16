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

export function SystemInfoModal({ isOpen, onClose }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-lg bg-white border border-slate-50 rounded-[32px] overflow-hidden shadow-2xl`}
          >
            <div className="p-8 border-b border-primary/10 flex justify-between items-center bg-white text-primary">
              <div className="flex items-center gap-3">
                <Logo variant="primary" size="md" />
                <div>
                  <h3 className="font-black uppercase tracking-widest text-xs">System Intelligence</h3>
                  <p className="text-[10px] text-primary/70">Internal Registry & Protocol Version</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={<Database className="w-4 h-4 text-primary" />} label="Database" value="Edge-Lite v4.2" />
                <InfoItem icon={<Activity className="w-4 h-4 text-primary" />} label="Security" value="AES-256 GCM" />
                <InfoItem icon={<Server className="w-4 h-4 text-primary" />} label="Environment" value="Production" />
                <InfoItem icon={<Clock className="w-4 h-4 text-primary" />} label="Uptime" value="99.98%" />
              </div>

              <div className={`p-6 rounded-2xl bg-slate-50 border border-slate-50`}>
                <h4 className="font-black text-[10px] text-primary uppercase tracking-widest mb-4">Core Protocol Version</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-primary">App Version</span>
                  <span className="text-xs font-mono bg-white text-primary border border-primary/20 px-2 py-0.5 rounded">2.0.4-stable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">Protocol Type</span>
                  <span className="text-xs font-mono bg-white text-primary border border-primary/20 px-2 py-0.5 rounded">HL7 Compliant</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-primary uppercase font-black tracking-widest mb-1 italic">Authorized Use Only</p>
                <p className="text-[9px] text-primary opacity-60"> Ministry of Health © 2026. Data is strictly regulated under the Healthcare Privacy Act.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function AccountSettingsModal({ isOpen, onClose, user }: ModalProps & { user: UserType | null }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-lg bg-white border border-slate-50 rounded-[32px] overflow-hidden shadow-2xl`}
          >
            <div className="p-8 border-b border-primary/10 flex justify-between items-center bg-white text-primary">
              <div className="flex items-center gap-3">
                <Logo variant="primary" size="md" />
                <div>
                  <h3 className="font-black uppercase tracking-widest text-xs">Profile Configuration</h3>
                  <p className="text-[10px] text-primary/70">Account Security & Access Tokens</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-3xl bg-white border-2 border-primary flex items-center justify-center text-primary text-2xl font-black shadow-lg">
                     {user?.health_facility_name.charAt(0)}
                   </div>
                   <div>
                     <h4 className="font-black text-lg text-primary">{user?.health_facility_name}</h4>
                     <p className="text-xs text-primary font-mono italic">Account ID: {user?.id.slice(0, 12)}...</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <SettingsField icon={<Building2 className="w-4 h-4 text-primary" />} label="Institution" value={user?.health_facility_name || '-'} />
                  <SettingsField icon={<User className="w-4 h-4 text-primary" />} label="Clearance Level" value={user?.role?.toUpperCase() || '-'} />
                  <SettingsField icon={<Shield className="w-4 h-4 text-primary" />} label="Security Status" value={user?.is_admin ? "Full Access Control" : "Standard Operator"} active />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button className="w-full p-4 rounded-2xl bg-white border border-primary text-[10px] font-black uppercase tracking-widest text-primary hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  Request Primary Key Reset
                </button>
                <p className="text-[10px] text-center text-primary italic">To modify institution records, please contact national administration.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SecurityVerificationModal({ isOpen, onClose, onVerified, actionLabel }: ModalProps & { onVerified: () => void, actionLabel: string }) {
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
            className="absolute inset-0 bg-white/90 backdrop-blur-lg"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative w-full max-sm bg-white border-2 border-primary rounded-[32px] overflow-hidden shadow-2xl`}
          >
            <div className="p-8 text-center space-y-6">
              <Logo size="lg" className="mx-auto" />

              <div className="space-y-2">
                <h3 className="text-xl font-black text-primary uppercase tracking-tighter">Identity Check Required</h3>
                <p className="text-xs text-primary leading-relaxed max-w-[240px] mx-auto">
                  You are performing a <span className="text-primary font-black uppercase">{actionLabel}</span> protocol. Please verify your clearance.
                </p>
              </div>

              <div className="space-y-4">
                <input 
                  autoFocus
                  type="password"
                  placeholder="Enter Security Passkey"
                  className={`w-full p-4 rounded-xl text-center text-lg font-bold border-2 transition-all outline-none border-slate-50 text-primary focus:border-primary bg-slate-50`}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                />

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={onClose}
                    className="p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary border border-primary hover:bg-slate-50 transition-all"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={handleVerify}
                    className="p-4 rounded-xl bg-white text-primary border border-primary text-[10px] font-black uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02]"
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

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className={`p-4 rounded-2xl border bg-white border-slate-50`}>
      <div className="text-primary mb-1">{icon}</div>
      <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-0.5">{label}</p>
      <p className="text-xs font-bold text-primary truncate">{value}</p>
    </div>
  );
}

function SettingsField({ icon, label, value, active = false }: { icon: any, label: string, value: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${active ? 'border-primary bg-slate-50' : 'border-slate-50 bg-white'}`}>
      <div className={`p-2 rounded-lg bg-white border border-primary/20 text-primary`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-primary">{label}</p>
        <p className="text-xs font-bold text-primary">{value}</p>
      </div>
    </div>
  );
}
