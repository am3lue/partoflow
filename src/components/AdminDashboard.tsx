import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, Activity, CheckCircle2, MapPin, Search, UserPlus, ShieldCheck, X, Eye, EyeOff, LayoutDashboard, Shield, Download } from 'lucide-react';
import { Logo } from './Logo';
import { SecurityVerificationModal } from './SettingsModals';
import { UnifiedMap } from './UnifiedMap';
import { User as UserType } from '../types';

interface Stats {
  total_facilities: number;
  active_cases: number;
  deliveries: number;
  recent_activity: any[];
}

interface Facility {
  id: string;
  name: string;
  facility_type: string;
  location_lat: number;
  location_lng: number;
}

export function AdminDashboard({ isDark, user }: { isDark: boolean, user: UserType }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFacilities = facilities.filter(f => 
    (f.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.facility_type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    if (filteredFacilities.length === 0) return;

    const headers = ['Facility Name', 'Type', 'Latitude', 'Longitude'];
    const rows = filteredFacilities.map(f => [
      f.name,
      f.facility_type,
      f.location_lat,
      f.location_lng
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `health_facilities_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, facilitiesRes] = await Promise.all([
        fetch(`/api/admin/stats?user_id=${user.id}`),
        fetch('/api/facilities')
      ]);
      const statsData = await statsRes.json();
      const facilitiesData = await facilitiesRes.json();
      
      setStats(statsData);
      setFacilities(facilitiesData);
    } catch (e) {
      console.error("Failed to fetch admin data", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <Logo size="lg" className="animate-pulse" />
        <p className="text-sm font-black uppercase tracking-widest text-primary/40">Loading System Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-primary mb-2">System Overview</h1>
            <p className="text-sm text-primary/60 font-medium italic">Administrative oversight of maternal health facilities</p>
          </div>
          <div className="flex bg-primary/5 p-1 rounded-xl border border-primary/10">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white text-primary shadow-sm border border-primary/5' : 'text-primary/40'}`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-primary shadow-sm border border-primary/5' : 'text-primary/40'}`}
            >
              User Mgmt
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  icon={<Building2 className="w-5 h-5" />} 
                  label="Total Facilities" 
                  value={stats?.total_facilities || 0} 
                  color="bg-primary"
                  isDark={isDark}
                />
                <StatCard 
                  icon={<Activity className="w-5 h-5" />} 
                  label="Active Labors" 
                  value={stats?.active_cases || 0} 
                  color="bg-primary"
                  isDark={isDark}
                />
                <StatCard 
                  icon={<CheckCircle2 className="w-5 h-5" />} 
                  label="Successfully Delivered" 
                  value={stats?.deliveries || 0} 
                  color="bg-primary"
                  isDark={isDark}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Map View */}
                <div className={`bg-white border-primary/10 border rounded-3xl p-6 shadow-sm`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <h2 className="font-black text-[10px] uppercase tracking-widest text-primary/40">Facility Distribution</h2>
                    </div>
                    
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/40" />
                      <input 
                        type="text"
                        placeholder="Search name or type..."
                        className={`w-full pl-9 pr-4 py-2 rounded-xl text-[10px] font-bold border focus:ring-4 focus:ring-primary/5 outline-none transition-all bg-white border-primary/10 text-primary placeholder:text-primary/30`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="h-[400px] rounded-2xl overflow-hidden border border-primary/10 relative z-0">
                    <UnifiedMap 
                      center={{ lat: -6.7924, lng: 39.2083 }}
                      zoom={10}
                      isDark={false}
                      markers={filteredFacilities.map(f => ({
                        id: f.id,
                        lat: Number(f.location_lat) || -6.7924,
                        lng: Number(f.location_lng) || 39.2083,
                        label: f.name
                      }))}

                    />
                  </div>
                </div>

                {/* Facilities List (Directory) */}
                <div className={`bg-white border-primary/10 border rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col`}>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <h2 className="font-black text-[10px] uppercase tracking-widest text-primary/40">Facilities Directory</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleExportCSV}
                        title="Export to CSV"
                        className={`p-1.5 rounded-lg border transition-all hover:scale-105 active:scale-95 bg-white border-primary/10 text-primary/60 hover:text-primary`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-black text-primary/40 bg-primary/5 px-2 py-0.5 rounded-full">
                        {filteredFacilities.length} Results
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[355px]">
                    {filteredFacilities.length > 0 ? (
                      filteredFacilities.map((f) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={f.id} 
                          className={`p-4 rounded-2xl border transition-all hover:border-primary/30 bg-white border-primary/10`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-xs mb-0.5 text-primary">{f.name}</h3>
                              <p className="text-[9px] text-primary/40 uppercase font-black tracking-wider">{f.facility_type}</p>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-mono text-primary/50">ID: {f.id.slice(0, 8)}</span>
                              <div className="flex items-center gap-1 text-[8px] text-primary/40 mt-1">
                                <MapPin className="w-2.5 h-2.5" />
                                <span>
                                  {f.location_lat != null ? f.location_lat.toFixed(4) : '0.0000'}, 
                                  {f.location_lng != null ? f.location_lng.toFixed(4) : '0.0000'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                        <Search className="w-8 h-8 mb-4 text-primary" />
                        <p className="text-xs font-medium text-primary">No facilities found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className={`bg-white border-primary/10 border rounded-3xl p-6 shadow-sm flex flex-col`}>
                   <div className="flex justify-between items-center mb-6">
                    <h2 className="font-black text-[10px] uppercase tracking-widest text-primary/40">System Activity</h2>
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {stats?.recent_activity?.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className={`p-4 rounded-2xl border bg-white border-primary/10`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-xs truncate capitalize block max-w-[150px] text-primary">{item.patient_name}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black bg-primary/10 text-primary`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-primary/40 font-medium italic">{item.facility_name}</span>
                          <span className="text-[9px] text-primary/40 font-mono">{item.admission_time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="users"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-black text-sm uppercase tracking-widest text-primary/40">User Management</h2>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-white text-primary border border-primary/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-primary/5 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Register New Admin
                </button>
              </div>

              <div className={`bg-white border-primary/10 border rounded-3xl p-8 text-center space-y-4`}>
                <ShieldCheck className="w-12 h-12 text-primary mx-auto opacity-20" />
                <h3 className="font-bold text-lg text-primary">Administrative Access Control</h3>
                <p className="text-sm text-primary/40 max-w-md mx-auto leading-relaxed">
                  You can manually register users and assign them administrative roles. Admin users have global visibility across all health facilities while Dispensary users are restricted to their local data.
                </p>
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                   <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-left">
                     <p className="font-black text-[10px] text-primary uppercase mb-1">Privileged User</p>
                     <p className="text-[11px] text-primary/60">Enable <span className="font-black text-primary">is_admin</span> to grant full system oversight and data export rights.</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-left">
                     <p className="font-black text-[10px] text-primary uppercase mb-1">Facility Staff</p>
                     <p className="text-[11px] text-primary/60">Standard accounts are bound to a specific Health Facility ID for data isolation.</p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Admin Registration Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-white border-primary/10 border w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col`}
            >
              <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-white text-primary">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="font-black uppercase tracking-widest text-xs">Register System Administrator</h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <AdminCreatorForm 
                isDark={false} 
                onSuccess={() => { setIsCreateModalOpen(false); fetchData(); }} 
                onRequireVerify={(action) => {
                   setPendingAction(() => action);
                   setIsVerifyModalOpen(true);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SecurityVerificationModal 
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        isDark={isDark}
        actionLabel="Register Security Official"
        onVerified={() => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
      />
    </div>
  );
}

function AdminCreatorForm({ isDark, onSuccess, onRequireVerify }: { isDark: boolean, onSuccess: () => void, onRequireVerify: (action: () => void) => void }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    id_number: '',
    password: '',
    is_admin: true,
    role: 'admin',
    health_facility_name: 'Ministry of Health'
  });

  const performSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSuccess();
      } else {
        alert("Failed to create admin user");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequireVerify(() => performSubmit());
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">First Name</label>
          <input 
            required
            className={`w-full p-4 rounded-2xl border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all bg-white border-primary/10 text-primary`}
            value={formData.first_name}
            onChange={e => setFormData({...formData, first_name: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Last Name</label>
          <input 
            required
            className={`w-full p-4 rounded-2xl border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all bg-white border-primary/10 text-primary`}
            value={formData.last_name}
            onChange={e => setFormData({...formData, last_name: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">ID Number / Badge No.</label>
        <input 
          required
          className={`w-full p-4 rounded-2xl border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all bg-white border-primary/10 text-primary`}
          value={formData.id_number}
          onChange={e => setFormData({...formData, id_number: e.target.value})}
        />
      </div>

      <div className="space-y-1.5 relative">
        <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Security Password</label>
        <div className="relative">
          <input 
            required
            type={showPassword ? "text" : "password"}
            className={`w-full p-4 rounded-2xl border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all pr-12 bg-white border-primary/10 text-primary`}
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-primary/40 hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg text-primary">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-primary">Administrator Privileges</p>
            <p className="text-[10px] text-primary/40">Sets is_admin = true in secure ledger</p>
          </div>
        </div>
        <div className="w-10 h-6 bg-primary rounded-full relative p-1 cursor-not-allowed cursor-pointer">
          <div className="w-4 h-4 bg-white rounded-full translate-x-4 transition-transform" />
        </div>
      </div>

      <button 
        disabled={loading}
        className="w-full bg-white text-primary border border-primary/20 p-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-sm hover:bg-primary/5 transition-all disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Register as Admin'}
      </button>
    </form>
  );
}

function StatCard({ icon, label, value, color, isDark }: { icon: any, label: string, value: number, color: string, isDark: boolean }) {
  return (
    <div className={`bg-white border-primary/10 border p-6 rounded-3xl shadow-sm relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-primary opacity-5 -translate-y-8 translate-x-8 rounded-full transition-transform group-hover:scale-110`} />
      <div className="relative z-10">
        <div className={`w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 shadow-sm border border-primary/5`}>
          <div className="text-primary italic">
            {icon}
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">{label}</p>
        <p className="text-3xl font-black tabular-nums text-primary">{value}</p>
      </div>
    </div>
  );
}
