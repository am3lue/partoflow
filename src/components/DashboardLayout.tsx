import { ReactNode, useState } from 'react';
import { LogOut, Activity, User as UserIcon, Moon, Sun, History, LayoutDashboard, ChevronDown, Shield, Settings, Info, Menu, X as CloseIcon } from 'lucide-react';
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
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function DashboardLayout({ 
  children, facilityName, onLogout, isDark, activeView, onViewChange, 
  role, is_admin, user, toggleSidebar, isSidebarOpen 
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'settings' | 'system' | null>(null);

  return (
    <div className={`flex flex-col h-screen bg-white text-primary font-sans overflow-hidden transition-colors duration-200`}>
      {/* Top Navigation */}
      <nav className="h-16 bg-white border-b border-primary/10 flex items-center justify-between px-4 md:px-8 shrink-0 z-50 relative">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={toggleSidebar}
            className="p-2 md:hidden text-primary hover:bg-primary/5 rounded-xl transition-colors"
          >
            {isSidebarOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Logo size="sm" className="md:w-8 md:h-8" />
          <span className="text-primary font-black text-lg md:text-xl tracking-tighter">PartoFlow</span>
          
          <div className="ml-4 md:ml-10 hidden sm:flex bg-primary/5 p-1 rounded-xl border border-primary/10">
            {(role === 'admin' || is_admin) && (
              <button 
                onClick={() => onViewChange('admin')}
                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[9px] md:text-[10px] uppercase font-black tracking-widest transition-all ${activeView === 'admin' ? 'bg-white text-primary shadow-sm border border-primary/5' : 'text-primary/60 hover:text-primary'}`}
              >
                <LayoutDashboard className="w-3 md:w-3.5 h-3 md:h-3.5" />
                <span className="hidden lg:inline">Control Center</span>
                <span className="lg:hidden">Admin</span>
              </button>
            )}
            <button 
              onClick={() => onViewChange('active')}
              className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[9px] md:text-[10px] uppercase font-black tracking-widest transition-all ${activeView === 'active' ? 'bg-white text-primary shadow-sm border border-primary/5' : 'text-primary/60 hover:text-primary'}`}
            >
              <Activity className="w-3 md:w-3.5 h-3 md:h-3.5" />
              <span className="hidden lg:inline">{(role === 'admin' || is_admin) ? 'Active Cases' : 'My Active'}</span>
              <span className="lg:hidden">Active</span>
            </button>
            <button 
              onClick={() => onViewChange('history')}
              className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[9px] md:text-[10px] uppercase font-black tracking-widest transition-all ${activeView === 'history' ? 'bg-white text-primary shadow-sm border border-primary/5' : 'text-primary/60 hover:text-primary'}`}
            >
              <History className="w-3 md:w-3.5 h-3 md:h-3.5" />
              <span className="hidden lg:inline">Archives</span>
              <span className="lg:hidden">Past</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-primary">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-primary/5 hover:bg-primary/10 pl-4 pr-3 py-1.5 rounded-2xl transition-all border border-primary/10 active:scale-95 group shadow-sm"
            >
              <div className="h-7 w-7 bg-white rounded-xl flex items-center justify-center text-primary ring-1 ring-primary/10">
                {is_admin ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="flex flex-col items-start pr-2">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none text-primary/60 mb-0.5">{role}</span>
                <span className="text-xs font-bold leading-none text-primary">{facilityName.split(' ')[0]}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                    className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-primary/10 overflow-hidden z-40"
                  >
                    <div className="p-4 border-b border-primary/5 bg-slate-50/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Signed in to</p>
                      <p className="text-sm font-bold truncate text-primary">{facilityName}</p>
                    </div>
                    
                    <div className="p-2">
                       <DropdownItem 
                        icon={<Settings className="w-4 h-4" />} 
                        label="Account Settings" 
                        isDark={false}
                        onClick={() => { setIsDropdownOpen(false); setActiveModal('settings'); }}
                      />
                       <DropdownItem 
                        icon={<Info className="w-4 h-4" />} 
                        label="System Info" 
                        isDark={false}
                        onClick={() => { setIsDropdownOpen(false); setActiveModal('system'); }}
                      />
                      <DropdownItem 
                        icon={<LogOut className="w-4 h-4" />} 
                        label="Sign Out" 
                        isDark={false}
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
        isDark={false} 
      />
      
      <AccountSettingsModal 
        isOpen={activeModal === 'settings'} 
        onClose={() => setActiveModal(null)} 
        isDark={false} 
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
          ? 'hover:bg-primary/10 text-primary' 
          : 'hover:bg-primary/5 text-primary/70 hover:text-primary'
      }`}
    >
      <div className={`p-2 rounded-lg transition-colors ${
        variant === 'danger' 
          ? 'bg-primary/10 text-primary' 
          : 'bg-primary/5 text-primary/50 group-hover:text-primary group-hover:bg-primary/10'
      }`}>
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
