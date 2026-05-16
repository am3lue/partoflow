import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, Activity, CheckCircle2, MapPin, Search, UserPlus, ShieldCheck, X, Eye, EyeOff, LayoutDashboard, Shield } from 'lucide-react';
import { Logo } from './Logo';
import { SecurityVerificationModal } from './SettingsModals';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Stats {
  total_facilities: number;
  active_cases: number;
  deliveries: number;
  recent_activity: any[];
}

interface Facility {
  id: string;
  health_facility_name: string;
  facility_type: string;
  location_lat: number;
  location_lng: number;
}

export function AdminDashboard({ isDark }: { isDark: boolean }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, facilitiesRes] = await Promise.all([
        fetch('/api/admin/stats'),
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
        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Loading System Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white mb-2">System Overview</h1>
            <p className="text-sm text-slate-500 font-medium italic">Administrative oversight of maternal health facilities</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}
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
                  color="bg-blue-500"
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
                  color="bg-green-500"
                  isDark={isDark}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Map View */}
                <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border rounded-3xl p-6 shadow-sm`}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Facility Distribution</h2>
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 relative z-0">
                    <MapContainer 
                      center={[-6.7924, 39.2083]} 
                      zoom={10} 
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {facilities.map(f => (
                        <Marker 
                          key={f.id} 
                          position={[f.location_lat || -6.7924, f.location_lng || 39.2083]} 
                          icon={DefaultIcon}
                        >
                          <Popup>
                            <div className="p-1">
                              <p className="font-bold text-xs mb-1">{f.health_facility_name}</p>
                              <p className="text-[10px] opacity-70 uppercase font-black">{f.facility_type}</p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border rounded-3xl p-6 shadow-sm flex flex-col`}>
                   <div className="flex justify-between items-center mb-6">
                    <h2 className="font-black text-[10px] uppercase tracking-widest text-slate-400">System Activity</h2>
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {stats?.recent_activity.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-xs truncate capitalize block max-w-[150px]">{item.client_name}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black ${item.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-green-100 text-green-600'}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-400 font-medium italic">{item.health_facility_name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{item.date_of_admission}</span>
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
                <h2 className="font-black text-sm uppercase tracking-widest text-slate-400">User Management</h2>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal/20 hover:scale-[1.02] transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Register New Admin
                </button>
              </div>

              <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border rounded-3xl p-8 text-center space-y-4`}>
                <ShieldCheck className="w-12 h-12 text-primary mx-auto opacity-20" />
                <h3 className="font-bold text-lg">Administrative Access Control</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  You can manually register users and assign them administrative roles. Admin users have global visibility across all health facilities while Dispensary users are restricted to their local data.
                </p>
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                   <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-left">
                     <p className="font-black text-[10px] text-primary uppercase mb-1">Privileged User</p>
                     <p className="text-[11px] text-slate-500">Enable <span className="font-black text-slate-700 dark:text-slate-200">is_admin</span> to grant full system oversight and data export rights.</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-left">
                     <p className="font-black text-[10px] text-blue-500 uppercase mb-1">Facility Staff</p>
                     <p className="text-[11px] text-slate-500">Standard accounts are bound to a specific Health Facility ID for data isolation.</p>
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
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col`}
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-primary text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="font-black uppercase tracking-widest text-xs">Register System Administrator</h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <AdminCreatorForm 
                isDark={isDark} 
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
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
          <input 
            required
            className={`w-full p-4 rounded-2xl border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100 text-slate-800'}`}
            value={formData.first_name}
            onChange={e => setFormData({...formData, first_name: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
          <input 
            required
            className={`w-full p-4 rounded-2xl border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100 text-slate-800'}`}
            value={formData.last_name}
            onChange={e => setFormData({...formData, last_name: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Number / Badge No.</label>
        <input 
          required
          className={`w-full p-4 rounded-2xl border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100 text-slate-800'}`}
          value={formData.id_number}
          onChange={e => setFormData({...formData, id_number: e.target.value})}
        />
      </div>

      <div className="space-y-1.5 relative">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Password</label>
        <div className="relative">
          <input 
            required
            type={showPassword ? "text" : "password"}
            className={`w-full p-4 rounded-2xl border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all pr-12 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100 text-slate-800'}`}
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary transition-colors"
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
            <p className="font-bold text-xs">Administrator Privileges</p>
            <p className="text-[10px] text-slate-400">Sets is_admin = true in secure ledger</p>
          </div>
        </div>
        <div className="w-10 h-6 bg-primary rounded-full relative p-1 cursor-not-allowed cursor-pointer">
          <div className="w-4 h-4 bg-white rounded-full translate-x-4 transition-transform" />
        </div>
      </div>

      <button 
        disabled={loading}
        className="w-full bg-primary text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-teal/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Register as Admin'}
      </button>
    </form>
  );
}

function StatCard({ icon, label, value, color, isDark }: { icon: any, label: string, value: number, color: string, isDark: boolean }) {
  return (
    <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border p-6 rounded-3xl shadow-sm relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 -translate-y-8 translate-x-8 rounded-full transition-transform group-hover:scale-110`} />
      <div className="relative z-10">
        <div className={`w-10 h-10 ${color} bg-opacity-10 rounded-xl flex items-center justify-center text-primary mb-4 ${isDark ? 'shadow-none' : 'shadow-teal/20 shadow-lg'}`}>
          <div className="text-primary italic">
            {icon}
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-black tabular-nums">{value}</p>
      </div>
    </div>
  );
}
