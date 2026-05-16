import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, User, FileText, ChevronRight, Activity, BookOpen, ShieldCheck, HelpCircle, Lock } from 'lucide-react';
import { DashboardLayout } from './components/DashboardLayout';
import { PartographTimeline } from './components/PartographTimeline';
import { AdmissionFormModal, ExaminationFormModal, DeliveryOutcomeModal } from './components/Modals';
import { SignupFlow, SignupData } from './components/SignupFlow';
import { UserGuide } from './components/UserGuide';
import { AdminDashboard } from './components/AdminDashboard';
import { SecurityVerificationModal } from './components/SettingsModals';
import { Logo } from './components/Logo';
import { User as UserType, Admission, Examination } from './types';

type Screen = 'login' | 'dashboard' | 'partograph';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [showSignup, setShowSignup] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeView, setActiveView] = useState<'active' | 'history' | 'admin'>('active');
  const isDark = true;

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const [user, setUser] = useState<UserType | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('partoflow_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [notifications, setNotifications] = useState<{ id: number, message: string, type: 'success' | 'error' }[]>([]);

  const addNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('partoflow_user', JSON.stringify(user));
      setScreen('dashboard');
    } else {
      localStorage.removeItem('partoflow_user');
      setScreen('login');
    }
  }, [user]);

  const [activeAdmissions, setActiveAdmissions] = useState<Admission[]>([]);
  const [historyAdmissions, setHistoryAdmissions] = useState<Admission[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Modals state
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [pendingSensitiveAction, setPendingSensitiveAction] = useState<(() => void) | null>(null);
  const [verificationLabel, setVerificationLabel] = useState('');

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.is_admin) {
        setActiveView('admin');
      }
      fetchActiveAdmissions();
      fetchHistoryAdmissions();
    }
  }, [user]);

  const fetchActiveAdmissions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admissions/active?facility_id=${user.id}&role=${user.role}&is_admin=${user.is_admin ? 1 : 0}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error ${res.status}: ${text}`);
      }
      const data = await res.json();
      setActiveAdmissions(data);
    } catch (err) {
      console.error("Failed to fetch active admissions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistoryAdmissions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admissions/history?facility_id=${user.id}&role=${user.role}&is_admin=${user.is_admin ? 1 : 0}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error ${res.status}: ${text}`);
      }
      const data = await res.json();
      setHistoryAdmissions(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdmissionDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/admissions/${id}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error ${res.status}: ${text}`);
      }
      const data = await res.json();
      setSelectedAdmission(data);
      setScreen('partograph');
    } catch (err) {
      console.error("Failed to fetch admission details:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    const target = e.target as any;
    const id_number = target.id_number.value;
    const password = target.password.value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number, password })
      });

      if (!res.ok) {
        throw new Error('Invalid ID or Password');
      }

      const data = await res.json();
      setUser(data);
      addNotification(`Welcome back, ${data.health_facility_name}`);
      setScreen('dashboard');
    } catch (err: any) {
      setLoginError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (signupData: SignupData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || 'Registration failed');
      }
      
      const data = await res.json();
      setUser(data);
      addNotification('Account created successfully');
      setScreen('dashboard');
      setShowSignup(false);
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || 'Registration failed');
      addNotification(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmission = async (data: any) => {
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, facility_id: user?.id })
      });
      const result = await res.json();
      setIsAdmissionModalOpen(false);
      addNotification('New admission recorded');
      fetchAdmissionDetails(result.event_id);
      fetchActiveAdmissions();
    } catch (err) {
      addNotification('Failed to record admission', 'error');
      console.error(err);
    }
  };

  const handleAddExam = async (data: any) => {
    if (!selectedAdmission) return;
    try {
      await fetch('/api/examinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, event_id: selectedAdmission.event_id })
      });
      setIsExamModalOpen(false);
      addNotification('Clinical examination updated');
      fetchAdmissionDetails(selectedAdmission.event_id);
    } catch (err) {
      addNotification('Failed to save examination', 'error');
      console.error(err);
    }
  };

  const handleDelivery = async () => {
    if (!selectedAdmission) return;
    try {
      await fetch(`/api/admissions/${selectedAdmission.event_id}/deliver`, {
        method: 'POST'
      });
      setIsDeliveryModalOpen(false);
      addNotification('Delivery recorded successfully');
      setScreen('dashboard');
      fetchActiveAdmissions();
      fetchHistoryAdmissions();
    } catch (err) {
      addNotification('Failed to record delivery', 'error');
      console.error(err);
    }
  };


  if (screen === 'login') {
    return (
      <div className={`min-h-screen ${isDark ? 'dark bg-slate-900 text-white' : 'bg-[#005B5C] text-slate-900'} flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-200`}>
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.03] rounded-full -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white opacity-[0.02] rounded-full -ml-32 -mb-32" />
        
        <AnimatePresence mode="wait">
          {showSignup ? (
            <SignupFlow 
              key="signup"
              isDark={isDark}
              onBack={() => setShowSignup(false)} 
              onComplete={handleSignup} 
              isLoading={isLoading}
            />
          ) : (
            <motion.div 
              key="login"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`w-full max-w-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-[32px] shadow-2xl p-10 z-10 border transition-colors duration-300`}
            >
              <div className="flex flex-col items-center mb-10 text-center">
                <Logo size="lg" className="mb-6" />
                <h1 
                  className={`text-3xl font-black tracking-tighter mb-1 transition-colors duration-300`}
                  style={{ color: isDark ? '#005b5c' : '#005b5c' }}
                >
                  PartoFlow
                </h1>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Clinical Labor Management</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Staff Identifier</label>
                  <input 
                    name="id_number" 
                    required 
                    placeholder="ID Number"
                    className={`w-full p-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all`}
                    style={{ 
                      backgroundColor: '#e4e4e4',
                      borderColor: isDark ? '#475569' : '#005b5c',
                      color:  '#005b5c',
                      borderWidth: '1px'
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Security Key</label>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className={`w-full p-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all`}
                    style={{ 
                      backgroundColor: '#e4e4e4',
                      borderColor: isDark ? '#475569' : '#005b5c',
                      color:  '#005b5c',
                      borderWidth: '1px'
                    }}
                  />
                </div>
                
                {loginError && (
                  <p className="text-[10px] font-bold text-secondary bg-secondary/5 p-3 rounded-xl border border-secondary/10 text-center uppercase tracking-wider italic">
                    {loginError}
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-teal hover:opacity-95 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Validating...
                    </div>
                  ) : 'Access Facility'}
                </button>
              </form>

              <div className="mt-8 flex flex-col items-center gap-4">
                <button 
                  onClick={() => setShowSignup(true)}
                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                  Register New Facility
                </button>
                <div className="flex gap-4">
                  <button onClick={() => setShowGuide(true)} className="p-2 text-slate-300 hover:text-primary transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showGuide && <UserGuide onClose={() => setShowGuide(false)} />}
        </AnimatePresence>
      </div>
    );
  }

  const admissionsList = activeView === 'active' ? activeAdmissions : historyAdmissions;

  return (
    <DashboardLayout 
      facilityName={user?.health_facility_name || 'Clinic'} 
      onLogout={() => { setScreen('login'); setUser(null); setSelectedAdmission(null); }}
      isDark={true}
      activeView={activeView}
      onViewChange={setActiveView}
      role={user?.role}
      is_admin={user?.is_admin}
      user={user}
    >
        <AnimatePresence>
          {showGuide && <UserGuide onClose={() => setShowGuide(false)} />}
        </AnimatePresence>

        {/* Sidebar logic */}
        <aside className={`w-72 md:w-80 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border-r flex flex-col shrink-0 z-10 transition-colors duration-200`}>
          <div className="p-6 border-b border-slate-50 flex justify-between items-center group">
            <h2 className="font-black text-slate-500 uppercase text-[10px] tracking-widest">
              {activeView === 'admin' ? 'System Overview' : activeView === 'active' ? 'Active Admissions' : 'Past Records'}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowGuide(true)} className="p-1 hover:text-primary text-slate-300 transition-colors">
                <HelpCircle className="w-4 h-4" />
              </button>
              <span className="bg-slate-100 text-primary px-2 py-0.5 rounded text-[10px] font-black">{admissionsList.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-300 uppercase">Synchronizing...</p>
              </div>
            ) : admissionsList.length === 0 ? (
              <div className="py-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-300 italic">No {activeView} cases</div>
            ) : (
              admissionsList.map(adm => (
                <div 
                  key={adm.event_id}
                  onClick={() => fetchAdmissionDetails(adm.event_id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedAdmission?.event_id === adm.event_id && screen === 'partograph' ? 'bg-primary text-white border-primary shadow-teal' : `${isDark ? 'bg-slate-700 hover:bg-slate-600 border-slate-700' : 'border-transparent hover:bg-slate-100'}`}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <h3 className={`font-bold text-xs truncate capitalize ${selectedAdmission?.event_id === adm.event_id && screen === 'partograph' ? 'text-white' : isDark ? 'text-slate-100' : 'text-slate-700'}`}>{adm.client_name}</h3>
                      {adm.status !== 'active' && (
                        <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black ${selectedAdmission?.event_id === adm.event_id && screen === 'partograph' ? 'bg-white/20' : 'bg-slate-100 opacity-50'}`}>{adm.status}</span>
                      )}
                    </div>
                    <span className={`text-[9px] font-mono italic whitespace-nowrap ml-2 ${selectedAdmission?.event_id === adm.event_id && screen === 'partograph' ? 'text-white/60' : 'text-slate-400'}`}>{adm.time_of_admission}</span>
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-tighter ${selectedAdmission?.event_id === adm.event_id && screen === 'partograph' ? 'text-white/60' : 'text-slate-400'}`}>Age {adm.age} • G{adm.gravidity} P{adm.parity}</p>
                </div>
              ))
            )}
          </div>
          {activeView === 'active' && !(user?.role === 'admin' || user?.is_admin) && (
            <button 
              onClick={() => setIsAdmissionModalOpen(true)}
              className={`m-4 p-4 border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500 hover:text-primary hover:border-primary/50' : 'border-slate-100 text-slate-300 hover:text-primary hover:border-primary/30'} rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2`}
            >
              <Plus className="w-3 h-3" /> New Admission
            </button>
          )}
        </aside>

        {/* Main View Area */}
        <main className={`flex-1 flex flex-col ${isDark ? 'bg-slate-900' : 'bg-slate-50'} overflow-hidden relative transition-colors duration-200`}>
          <AnimatePresence mode="wait">
            {activeView === 'admin' ? (
              <motion.div
                key="admin-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <AdminDashboard isDark={isDark} />
              </motion.div>
            ) : screen === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="max-w-xs space-y-4">
                  <div className={`w-20 h-20 ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-[32px] flex items-center justify-center text-primary mx-auto mb-6 shadow-xl`}>
                    <BookOpen className="w-8 h-8 opacity-20" />
                  </div>
                  <h2 className={`text-xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Patient Selection</h2>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    Select a patient from the sidebar to view their digital partograph or {activeView === 'active' ? 'initialize a new labor record' : 'review clinical history'}.
                  </p>
                  <div className={`mt-8 p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl border`}>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" />
                      Security Protocol
                    </p>
                    <p className="text-[10px] text-slate-400 italic">Sensitive medical data is encrypted at rest using AES-256-CBC protocol.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="partograph"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {selectedAdmission && (
                  <PartographTimeline 
                    admission={selectedAdmission} 
                    onAddSegment={() => setIsExamModalOpen(true)}
                    onRecordDelivery={() => setIsDeliveryModalOpen(true)}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Modals */}
        <AdmissionFormModal 
          isOpen={isAdmissionModalOpen} 
          onClose={() => setIsAdmissionModalOpen(false)} 
          onSave={handleAddAdmission} 
        />
        
        <ExaminationFormModal 
          isOpen={isExamModalOpen} 
          onClose={() => setIsExamModalOpen(false)} 
          onSave={handleAddExam} 
        />

        <DeliveryOutcomeModal 
          isOpen={isDeliveryModalOpen} 
          onClose={() => setIsDeliveryModalOpen(false)} 
          onConfirm={() => {
            setPendingSensitiveAction(() => () => handleDelivery());
            setVerificationLabel('Record Clinical Outcome');
            setIsVerificationModalOpen(true);
          }} 
        />

        <SecurityVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          isDark={isDark}
          actionLabel={verificationLabel}
          onVerified={() => {
            if (pendingSensitiveAction) {
              pendingSensitiveAction();
              setPendingSensitiveAction(null);
            }
          }}
        />

        {/* Global Notifications */}
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
          <AnimatePresence>
            {notifications.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 min-w-[280px] ${
                  n.type === 'error' 
                    ? 'bg-secondary text-white border-secondary/20' 
                    : 'bg-primary text-white border-primary/20'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  {n.type === 'error' ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <p className="text-xs font-black uppercase tracking-widest leading-relaxed">{n.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </DashboardLayout>
  );
}
