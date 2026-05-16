import { ReactNode, useState } from 'react';
import { LogOut, Activity, User as UserIcon, Moon, Sun, History, LayoutDashboard, ChevronDown, Shield, Settings, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemInfoModal, AccountSettingsModal } from './SettingsModals';
import { Logo } from './Logo';
import { User as UserType } from '../types';

interface Props {
  children: ReactNode;
  facilityName: string;
  onLogout: () => void;
  isDark: boolean;
  activeView: 'active' | 'history' | 'admin';
  onViewChange: (view: 'active' | 'history' | 'admin') => void;
  role?: string;
  is_admin?: boolean;
  user: UserType | null;
}

export function DashboardLayout({ children, facilityName, onLogout, isDark, activeView, onViewChange, role, is_admin, user }: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'settings' | 'system' | null>(null);

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} font-sans overflow-hidden transition-colors duration-200`}>
      {/* Top Navigation */}
      <nav className="h-16 bg-primary flex items-center justify-between px-8 shrink-0 z-20 shadow-lg relative">
        <div className="flex items-center gap-3">
          <Logo variant="white" size="md" />
          <span className="text-white font-black text-xl tracking-tighter">PartoFlow</span>
          
          <div className="ml-10 flex bg-black/10 p-1.5 rounded-xl border border-white/5">
            {(role === 'admin' || is_admin) && (
              <button 
                onClick={() => onViewChange('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all ${activeView === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-white/60 hover:text-white'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Control Center
              </button>
            )}
            <button 
              onClick={() => onViewChange('active')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all ${activeView === 'active' ? 'bg-white text-primary shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              <Activity className="w-3.5 h-3.5" />
              {(role === 'admin' || is_admin) ? 'Active Cases' : 'My Active'}
            </button>
            <button 
              onClick={() => onViewChange('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all ${activeView === 'history' ? 'bg-white text-primary shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              <History className="w-3.5 h-3.5" />
              Archives
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-white/90">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 pl-4 pr-3 py-1.5 rounded-2xl transition-all border border-white/10 active:scale-95 group shadow-sm"
            >
              <div className="h-7 w-7 bg-white/20 rounded-xl flex items-center justify-center text-white ring-1 ring-white/10">
                {is_admin ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="flex flex-col items-start pr-2">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none text-white/60 mb-0.5">{role}</span>
                <span className="text-xs font-bold leading-none">{facilityName.split(' ')[0]}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-white/40 group-hover:text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-40"
                  >
                    <div className="p-4 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Signed in to</p>
                      <p className="text-sm font-bold truncate dark:text-white">{facilityName}</p>
                    </div>
                    
                    <div className="p-2">
                       <DropdownItem 
                        icon={<Settings className="w-4 h-4" />} 
                        label="Account Settings" 
                        isDark={isDark}
                        onClick={() => { setIsDropdownOpen(false); setActiveModal('settings'); }}
                      />
                       <DropdownItem 
                        icon={<Info className="w-4 h-4" />} 
                        label="System Info" 
                        isDark={isDark}
                        onClick={() => { setIsDropdownOpen(false); setActiveModal('system'); }}
                      />
                      <DropdownItem 
                        icon={<LogOut className="w-4 h-4" />} 
                        label="Sign Out" 
                        isDark={isDark}
                        onClick={() => { setIsDropdownOpen(false); onLogout(); }}
                        variant="danger"
                      />
                    </div>
                    
                    <div className="p-3 bg-primary/5 border-t border-primary/5 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Version 2.0.4</span>
                      {(role === 'admin' || is_admin) && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden transition-colors duration-200">
        {children}
      </div>

      <SystemInfoModal 
        isOpen={activeModal === 'system'} 
        onClose={() => setActiveModal(null)} 
        isDark={isDark} 
      />
      
      <AccountSettingsModal 
        isOpen={activeModal === 'settings'} 
        onClose={() => setActiveModal(null)} 
        isDark={isDark} 
        user={user}
      />
    </div>
  );
}

function DropdownItem({ icon, label, onClick, isDark, variant = 'default' }: { 
  icon: any, 
  label: string, 
  onClick?: () => void, 
  isDark: boolean,
  variant?: 'default' | 'danger'
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${
        variant === 'danger' 
          ? 'hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500' 
          : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary'
      }`}
    >
      <div className={`p-2 rounded-lg transition-colors ${
        variant === 'danger' 
          ? 'bg-red-100/50 dark:bg-red-500/20 text-red-500' 
          : 'bg-slate-100/50 dark:bg-slate-700/50 text-slate-400 group-hover:text-primary group-hover:bg-primary/10'
      }`}>
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
